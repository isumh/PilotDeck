export {
  BackgroundTaskRuntime,
  type BackgroundTaskRuntimeOptions,
  type StartTaskSpec,
  type StopTaskOptions,
} from "./runtime/BackgroundTaskRuntime.js";
export { TaskOutputStore, type TaskOutputStoreOptions } from "./storage/TaskOutputStore.js";
export type {
  EastYunDeskBackgroundBashTask,
  EastYunDeskBackgroundTaskKind,
  EastYunDeskBackgroundTaskListFilter,
  EastYunDeskBackgroundTaskStatus,
  EastYunDeskTaskOutputSlice,
} from "./protocol/types.js";
