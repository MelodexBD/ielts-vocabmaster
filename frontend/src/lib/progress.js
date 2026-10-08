import { MODULE_NAMES, TESTS } from './data';

// Percentage of Cambridge tests (T1–T4) marked as completed, per module and overall.
export function moduleProgress(completedTests, moduleName) {
  return Math.round(completedTests(moduleName).length / TESTS.length * 100);
}

export function overallProgress(completedTests) {
  const total = MODULE_NAMES.reduce((sum, name) => sum + moduleProgress(completedTests, name), 0);
  return Math.round(total / MODULE_NAMES.length);
}
