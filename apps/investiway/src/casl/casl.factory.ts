import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { CaslAction } from './casl.enum';
import { User } from '../schema/user.schema';
import { GoalType } from '../schema/goal-type.schema';
import { Goal } from 'src/schema/goal.schema';

type Subjects =
  | InferSubjects<typeof User | typeof GoalType | typeof Goal>
  | 'all';

export type AppAbility = Ability<[CaslAction, Subjects]>;

export class CaslAppFactory {
  createForUser(user: User) {
    const { can, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>,
    );

    const userId = user._id as any;

    // goal-type
    can(CaslAction.Read, GoalType, { userId });
    can(CaslAction.Update, GoalType, { userId });
    can(CaslAction.Delete, GoalType, { userId });
    can(CaslAction.Create, GoalType, { userId });

    // goal
    can(CaslAction.Read, Goal, { userId });
    can(CaslAction.Update, Goal, { userId });
    can(CaslAction.Delete, Goal, { userId });
    can(CaslAction.Create, Goal, { userId });

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
