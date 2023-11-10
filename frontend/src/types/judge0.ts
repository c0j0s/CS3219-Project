export type judge0Request = {
  language_id: number;
  source_code: string;
};

export type judge0Response = {
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  message?: string;
  token?: string;
  statusId: number;
  description: string;
};

export enum Judge0Status {
  IN_QUEUE = 1,
  PROCESSING = 2,
  ACCEPTED = 3,
  WRONG_ANSWER = 4,
  TIME_LIMIT_EXCEEDED = 5,
  COMPILATION_ERROR = 6,
  RUNTIME_ERROR_SIGSEGV = 7,
  RUNTIME_ERROR_SIGXFSZ = 8,
  RUNTIME_ERROR_SIGFPE = 9,
  RUNTIME_ERROR_SIGABRT = 10,
  RUNTIME_ERROR_NZEC = 11,
  RUNTIME_ERROR_OTHER = 12,
  INTERNAL_ERROR = 13,
  EXEC_FORMAT_ERROR = 14,
}

export enum Judge0Language {
  CPP = 54,
  JAVA = 62,
  PYTHON = 71,
  JAVASCRIPT = 63,
}
