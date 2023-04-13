import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
  mongoQueryMatcher,
} from '@casl/ability';
import { CaslAction } from './casl.enum';
import { User } from '../schema/user.schema';
import { GoalType } from '../schema/goal-type.schema';

type Subjects = InferSubjects<typeof User | typeof GoalType> | 'all';

export type AppAbility = Ability<[CaslAction, Subjects]>;

export class CaslAppFactory {
  createForUser(user: User) {
    const { can, cannot, build, rules } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>,
    );

    const userId = user._id as any;

    // goal-type
    can(CaslAction.Read, GoalType, { userId });
    can(CaslAction.Update, GoalType, { userId });
    can(CaslAction.Delete, GoalType, { userId });
    can(CaslAction.Create, GoalType, { userId });

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
