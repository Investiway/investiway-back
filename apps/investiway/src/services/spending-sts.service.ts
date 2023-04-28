import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { FilterQuery, Model } from 'mongoose';
import { ESpendingStsType, SpendingSts } from 'src/schema/spending-sts.schema';
import { Spending } from 'src/schema/spending.schema';
import { SchemaUtils } from 'src/utils/schema.utils';

@Injectable()
export class SpendingStsService {
  constructor(
    @InjectModel(SpendingSts.name)
    private readonly spendingStsModel: Model<SpendingSts>,
  ) {}

  async updateRowSpending(spendingOld: Spending, spendingNew: Spending) {
    await this.updateRowSpendingProcess(spendingOld, spendingNew, false);
    await this.updateRowSpendingProcess(spendingOld, spendingNew, true);
  }

  private async updateRowSpendingProcess(
    spendingOld: Spending,
    spendingNew: Spending,
    notSpendingType = false,
  ) {
    const stsTypes = [
      ESpendingStsType.Day,
      ESpendingStsType.Month,
      ESpendingStsType.Year,
    ];
    const date = SchemaUtils.getCreatedAt(spendingOld);
    for (const type of stsTypes) {
      const stsId = this.date2timeId(date, type);
      const stsRowTypeOptions: FilterQuery<SpendingSts> = {
        userId: spendingOld.userId,
        stsId,
      };
      if (!notSpendingType) {
        stsRowTypeOptions.spendingTypeId = spendingOld.spendingTypeId;
      } else {
        stsRowTypeOptions.spendingTypeId = null;
      }
      const row = await this.spendingStsModel.findOne(stsRowTypeOptions);

      // (avg_old * n - e + u) / (n + 1)
      const totalWithoutOld = row.amountTotal - spendingOld.amount;
      const totalAfterUpdate = totalWithoutOld + spendingNew.amount;
      const avg = totalAfterUpdate / row.count;
      row.amountAvg = avg;
      row.amountTotal = totalAfterUpdate;
      await row.save();
    }
  }

  async pushRowSpending(spending: Spending) {
    await this.pushRowSpendingProcess(spending, false);
    await this.pushRowSpendingProcess(spending, true);
  }

  private async pushRowSpendingProcess(
    spending: Spending,
    notSpendingType = false,
  ) {
    const stsTypes = [
      ESpendingStsType.Day,
      ESpendingStsType.Month,
      ESpendingStsType.Year,
    ];
    const date = SchemaUtils.getCreatedAt(spending);
    for (const type of stsTypes) {
      const stsId = this.date2timeId(date, type);
      const stsRowTypeOptions: FilterQuery<SpendingSts> = {
        userId: spending.userId,
        stsId,
      };
      if (!notSpendingType) {
        stsRowTypeOptions.spendingTypeId = spending.spendingTypeId;
      } else {
        stsRowTypeOptions.spendingTypeId = null;
      }
      let row = await this.spendingStsModel.findOne(stsRowTypeOptions);
      if (!row) {
        row = await this.spendingStsModel.create({});
        row.userId = spending.userId;
        row.stsId = stsId;
        row.amountAvg = 0;
        row.amountTotal = 0;
        row.count = 0;
        row.type = type;
        if (!notSpendingType) {
          row.spendingTypeId = spending.spendingTypeId;
        }
      }

      // (avg_old * n + x) / (n + 1)
      const totalNew = row.amountTotal + spending.amount;
      const avg = totalNew / ++row.count;
      row.amountAvg = avg;
      row.amountTotal = totalNew;
      await row.save();
    }
  }

  async deleteRowSpending(spending: Spending) {
    await this.deleteRowSpendingProcess(spending);
    await this.deleteRowSpendingProcess(spending, true);
  }

  private async deleteRowSpendingProcess(
    spending: Spending,
    notSpendingType = false,
  ) {
    const stsTypes = [
      ESpendingStsType.Day,
      ESpendingStsType.Month,
      ESpendingStsType.Year,
    ];
    const date = SchemaUtils.getCreatedAt(spending);
    for (const type of stsTypes) {
      const stsId = this.date2timeId(date, type);
      const stsRowTypeOptions: FilterQuery<SpendingSts> = {
        userId: spending.userId,
        stsId,
      };
      if (!notSpendingType) {
        stsRowTypeOptions.spendingTypeId = spending.spendingTypeId;
      } else {
        stsRowTypeOptions.spendingTypeId = null;
      }
      const row = await this.spendingStsModel.findOne(stsRowTypeOptions);

      // (avg_old * n - e) / (n - 1)
      const totalWithoutOld = row.amountTotal - spending.amount;
      const avg = totalWithoutOld / --row.count;
      row.amountAvg = avg;
      row.amountTotal = totalWithoutOld;
      await row.save();
    }
  }

  private date2timeId(date: Date, type: ESpendingStsType) {
    const d = moment(date);
    const dy = d.year().toString().padStart(4, '0');
    const dm = d.month().toString().padStart(2, '0');
    const dd = d.date().toString().padStart(2, '0');
    const dt = type.toString().padEnd(2, '0');
    const dsize = 10;
    let id = null;
    switch (type) {
      case ESpendingStsType.Day:
        id = `${dt}${dy}${dm}${dd}`;
        break;
      case ESpendingStsType.Month:
        id = `${dt}${dy}${dm}`;
        break;
      case ESpendingStsType.Year:
        id = `${dt}${dy}`;
        break;
      default:
        throw `${dt} not supported!`;
    }
    return id ? Number.parseInt(id.padEnd(dsize, '0')) : 0;
  }
}
