export type Role = "user" | "assistant";

export interface Message {
  role: Role;
  content: string;
}

export interface GrokResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  error?: {
    message: string;
  };
}
