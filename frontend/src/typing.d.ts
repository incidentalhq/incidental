// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type ArraySchema } from 'yup'

declare module 'yup' {
  interface ArraySchema {
    unique(msg: string): ArraySchema
  }
}
