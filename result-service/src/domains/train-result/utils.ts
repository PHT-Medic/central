import { v4 } from 'uuid';

export function generateResultId() : string {
    return v4().toString();
}
