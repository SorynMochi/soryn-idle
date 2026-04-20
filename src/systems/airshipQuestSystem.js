import {
  AIRSHIP_BOARD_UNLOCK,
  AIRSHIP_QUESTS,
  AIRSHIP_QUESTS_BY_ID,
  QUEST_UNLOCK_HOOKS
} from '../content/quests.js';
import { nextRandomFloat } from '../core/random.js';
import { partySystem } from './partySystem.js';

const MAX_HISTORY = 30;
const MIN_SUCCESS_CHANCE = 0.05;
const MAX_SUCCESS_CHANCE = 0.98;

export const airshipQuestSystem = {
  id: 'airshipQuests',
  update(state, ctx) {
    let changed = false;

    const wasUnlocked = state.airshipQuests.unlocked;
    state.airshipQuests.unlocked = checkUnlockCondition(state, AIRSHIP_BOARD_UNLOCK);
    if (!wasUnlocked && state.airshipQuests.unlocked) {
      ctx.events.push('Airship board unlocked: dispatch squad missions from the Quests tab.');
      changed = true;
    }

    if (!state.airshipQuests.unlocked) {
      return changed;
    }

    for (const quest of AIRSHIP_QUESTS) {
      if (!state.airshipQuests.unlockedQuestIds.includes(quest.id) && checkUnlockCondition(state, quest.unlock)) {
        state.airshipQuests.unlockedQuestIds.push(quest.id);
        ctx.events.push(`Airship quest unlocked: ${quest.title}.`);
        changed = true;
      }
    }

    const now = Date.now();
    const activeRuns = Object.values(state.airshipQuests.activeRunsById);
    for (const run of activeRuns) {
      if (run.resolvedAt || now < run.endsAt) {
        continue;
      }

      resolveRun(state, run, now, ctx);
      changed = true;
    }

    return changed;
  },
  canStartQuest(state, questId, assignedInstanceIds) {
    if (!state.airshipQuests.unlocked) {
      return { ok: false, reason: 'The airship board has not been unlocked yet.' };
    }

    const quest = AIRSHIP_QUESTS_BY_ID[questId];
    if (!quest) {
      return { ok: false, reason: 'Unknown quest.' };
    }

    if (!state.airshipQuests.unlockedQuestIds.includes(questId)) {
      return { ok: false, reason: 'Quest not unlocked yet.' };
    }

    if (state.airshipQuests.activeRunsByQuestId[questId]) {
      return { ok: false, reason: 'That quest is already in progress.' };
    }

    const dedupedIds = [...new Set((assignedInstanceIds ?? []).filter(Boolean))];
    if (!dedupedIds.length) {
      return { ok: false, reason: 'Assign at least one character.' };
    }

    if (dedupedIds.length > quest.maxAssignees) {
      return { ok: false, reason: `This route allows up to ${quest.maxAssignees} assignees.` };
    }

    for (const instanceId of dedupedIds) {
      const instance = state.roster.byInstanceId[instanceId];
      if (!instance) {
        return { ok: false, reason: 'Assigned character is not owned.' };
      }

      if (instance.lockState?.locked) {
        return { ok: false, reason: `${instanceId} is already assigned elsewhere.` };
      }
    }

    return { ok: true, dedupedIds, quest };
  },
  startQuest(state, questId, assignedInstanceIds) {
    const eligibility = this.canStartQuest(state, questId, assignedInstanceIds);
    if (!eligibility.ok) {
      return eligibility;
    }

    const { quest, dedupedIds } = eligibility;
    const now = Date.now();
    const assignedMembers = dedupedIds.map((instanceId) => partySystem.getRosterView(state, instanceId)).filter(Boolean);
    const successChance = calculateSuccessChance(quest, assignedMembers);
    const runId = `aqr_${String(state.airshipQuests.nextRunId).padStart(5, '0')}`;
    state.airshipQuests.nextRunId += 1;

    const run = {
      runId,
      questId: quest.id,
      startedAt: now,
      endsAt: now + quest.durationMs,
      assignedInstanceIds: dedupedIds,
      assignedSnapshot: assignedMembers.map((member) => ({
        instanceId: member.instanceId,
        name: member.name,
        finalStats: member.finalStats
      })),
      successChance,
      resolvedAt: null
    };

    state.airshipQuests.activeRunsById[runId] = run;
    state.airshipQuests.activeRunsByQuestId[quest.id] = runId;

    for (const instanceId of dedupedIds) {
      const instance = state.roster.byInstanceId[instanceId];
      instance.lockState = {
        locked: true,
        system: 'airshipQuests',
        referenceId: runId,
        reason: quest.title,
        untilTs: run.endsAt
      };
    }

    partySystem.normalize(state);

    return {
      ok: true,
      quest,
      run
    };
  },
  getQuestStatus(state, quest) {
    if (!state.airshipQuests.unlocked) {
      return 'board_locked';
    }

    if (state.airshipQuests.activeRunsByQuestId[quest.id]) {
      return 'in_progress';
    }

    if (!state.airshipQuests.unlockedQuestIds.includes(quest.id)) {
      return 'locked';
    }

    return 'available';
  },
  getActiveRuns(state) {
    return Object.values(state.airshipQuests.activeRunsById)
      .sort((a, b) => a.endsAt - b.endsAt)
      .map((run) => ({
        ...run,
        quest: AIRSHIP_QUESTS_BY_ID[run.questId],
        remainingMs: Math.max(0, run.endsAt - Date.now())
      }));
  },
  getHistory(state) {
    return state.airshipQuests.history.slice(0, MAX_HISTORY);
  },
  calculateSuccessChance(state, questId, assignedInstanceIds) {
    const quest = AIRSHIP_QUESTS_BY_ID[questId];
    if (!quest) {
      return 0;
    }

    const assignedMembers = [...new Set((assignedInstanceIds ?? []).filter(Boolean))]
      .map((instanceId) => partySystem.getRosterView(state, instanceId))
      .filter(Boolean);

    return calculateSuccessChance(quest, assignedMembers);
  }
};

function resolveRun(state, run, now, ctx) {
  const quest = AIRSHIP_QUESTS_BY_ID[run.questId];
  if (!quest) {
    return;
  }

  const successRoll = nextRandomFloat(state);
  const success = successRoll <= run.successChance;
  const rewardPool = success ? quest.rewards.success : quest.rewards.failure;
  const rewardMultiplier = getQuestRewardMultiplier(state, run.assignedInstanceIds);
  const rewardResult = rollRewards(state, rewardPool, rewardMultiplier);

  run.resolvedAt = now;

  for (const instanceId of run.assignedInstanceIds) {
    const instance = state.roster.byInstanceId[instanceId];
    if (!instance || !instance.lockState?.locked || instance.lockState.referenceId !== run.runId) {
      continue;
    }

    instance.lockState = null;
  }

  delete state.airshipQuests.activeRunsById[run.runId];
  delete state.airshipQuests.activeRunsByQuestId[run.questId];

  state.airshipQuests.history.unshift({
    runId: run.runId,
    questId: run.questId,
    startedAt: run.startedAt,
    endedAt: run.endsAt,
    resolvedAt: now,
    assignedSnapshot: run.assignedSnapshot,
    successChance: run.successChance,
    success,
    rewards: rewardResult
  });
  state.airshipQuests.history = state.airshipQuests.history.slice(0, MAX_HISTORY);

  partySystem.normalize(state);
  const shardText = rewardResult.shards ? ` · ${rewardResult.shards} Crystal Shards` : '';
  ctx.events.push(`${quest.title} ${success ? 'succeeded' : 'failed'} · ${rewardResult.gil} Gil${shardText}`);
}

function checkUnlockCondition(state, unlock) {
  const hook = QUEST_UNLOCK_HOOKS[unlock?.id];
  if (!hook) {
    return true;
  }

  return Boolean(hook(state, unlock.params));
}

function calculateSuccessChance(quest, assignedMembers) {
  if (!assignedMembers.length) {
    return MIN_SUCCESS_CHANCE;
  }

  const totals = assignedMembers.reduce((acc, member) => {
    for (const [statKey, amount] of Object.entries(member.finalStats)) {
      acc[statKey] = (acc[statKey] ?? 0) + amount;
    }
    return acc;
  }, {});

  const requirementEntries = Object.entries(quest.statRequirements ?? {});
  if (!requirementEntries.length) {
    return 0.9;
  }

  let fulfillment = 0;
  let shortfallPenalty = 0;

  for (const [statKey, requirement] of requirementEntries) {
    const total = totals[statKey] ?? 0;
    const ratio = requirement > 0 ? total / requirement : 1;
    fulfillment += Math.min(1.5, ratio);

    if (ratio < 1) {
      shortfallPenalty += 1 - ratio;
    }
  }

  const averageFulfillment = fulfillment / requirementEntries.length;
  const teamBonus = Math.min(0.12, Math.max(0, assignedMembers.length - 1) * 0.04);
  const chance = 0.5 + (averageFulfillment - 1) * 0.34 + teamBonus - shortfallPenalty * 0.25;

  return clamp(chance, MIN_SUCCESS_CHANCE, MAX_SUCCESS_CHANCE);
}

function rollRewards(state, rewardPool, rewardMultiplier) {
  let gil = 0;
  let shards = 0;

  for (const reward of rewardPool ?? []) {
    const min = Math.min(reward.min ?? 0, reward.max ?? 0);
    const max = Math.max(reward.min ?? 0, reward.max ?? 0);
    const baseRoll = min + Math.floor(nextRandomFloat(state) * (max - min + 1));
    const scaled = Math.max(0, Math.floor(baseRoll * rewardMultiplier));

    if (reward.type === 'gil') {
      gil += scaled;
    }

    if (reward.type === 'shards') {
      shards += scaled;
    }
  }

  state.economy.gold += gil;
  state.economy.shards += shards;
  state.currencies.gil = Math.floor(state.economy.gold);
  state.currencies.crystalShards = Math.floor(state.economy.shards);

  return { gil, shards };
}

function getQuestRewardMultiplier(state, assignedInstanceIds) {
  const activeHooks = (assignedInstanceIds ?? [])
    .map((instanceId) => partySystem.getRosterView(state, instanceId))
    .filter(Boolean)
    .map((member) => member.passiveSpecialtyHooks?.hooks?.questRewards ?? 1);

  if (!activeHooks.length) {
    return 1;
  }

  const average = activeHooks.reduce((sum, value) => sum + value, 0) / activeHooks.length;
  return clamp(average, 1, 1.5);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
