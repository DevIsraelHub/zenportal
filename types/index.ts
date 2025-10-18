export interface User {
  email: string
  name: string
  plan: "free" | "starter" | "core"
}