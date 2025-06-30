import {
  MongooseClient,
  MongooseFilterQuery,
  MongooseModel,
  MongooseSchema,
  MongooseUpdateQuery,
  mongoQueryBuilder,
} from 'base-server';

const schema = new MongooseSchema<any>(
  {},
  {
    timestamps: true,
  },
);

class BoilerPlateModel {
  private _model: MongooseModel<any>;
  constructor({ mongooseClient }: { mongooseClient: MongooseClient }) {
    this._model = mongooseClient.model('boilerplate', schema);
  }
}

export default BoilerPlateModel;
