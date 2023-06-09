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
import { Note } from 'src/schema/note.schema';
import { SpendingType } from 'src/schema/spending-type.schema';
import { Spending } from 'src/schema/spending.schema';

type Subjects =
  | InferSubjects<
      | typeof User
      | typeof GoalType
      | typeof Goal
      | typeof SpendingType
      | typeof Spending
    >
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

    // note
    can(CaslAction.Read, Note, { userId });
    can(CaslAction.Update, Note, { userId });
    can(CaslAction.Delete, Note, { userId });
    can(CaslAction.Create, Note, { userId });

    // spending type
    can(CaslAction.Read, SpendingType, { userId });
    can(CaslAction.Update, SpendingType, { userId });
    can(CaslAction.Delete, SpendingType, { userId });
    can(CaslAction.Create, SpendingType, { userId });

    // spending type
    can(CaslAction.Read, Spending, { userId });
    can(CaslAction.Update, Spending, { userId });
    can(CaslAction.Delete, Spending, { userId });
    can(CaslAction.Create, Spending, { userId });

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
