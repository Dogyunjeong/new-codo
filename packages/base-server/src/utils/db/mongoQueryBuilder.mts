import { isArray, isDate, isNil, isObject } from 'lodash-es';

enum ARRAY_HANDLE_METHOD {
  ADD_TO_SET = 'add_to_set_query',
  SET = 'set_query',
}

class mongoQueryBuilder {
  private static _buildUpdateQuery = (
    payload: Record<string, any>,
    updateObject: Record<string, any>,
    prevKeys: string[],
    arrayHandleMethod: ARRAY_HANDLE_METHOD,
  ) => {
    if (payload === undefined) {
      return updateObject;
    }
    if (isDate(payload)) {
      updateObject[prevKeys.join('.')] = payload;
      return updateObject;
    }
    if (!isObject(payload) && !isArray(payload)) {
      return updateObject;
    }
    Object.keys(payload).forEach((key) => {
      const keys = [...prevKeys, key];
      const data = payload[key];
      if (isObject(data) && !isArray(data)) {
        mongoQueryBuilder._buildUpdateQuery(
          data as Record<string, any>,
          updateObject,
          keys,
          arrayHandleMethod,
        );
        return;
      }
      if (isArray(data)) {
        if (arrayHandleMethod === ARRAY_HANDLE_METHOD.ADD_TO_SET) {
          updateObject[keys.join('.')] = { $each: data };
          return;
        }
        if (arrayHandleMethod === ARRAY_HANDLE_METHOD.SET) {
          updateObject[keys.join('.')] = data;
          return;
        }
      }
      if (isNil(data)) {
        return;
      }
      updateObject[keys.join('.')] = data;
    });
    return updateObject;
  };
  static buildAddToSetUpdateQuery = (data: Record<string, any>) => {
    const updateData = mongoQueryBuilder._buildUpdateQuery(
      data,
      {},
      [],
      ARRAY_HANDLE_METHOD.ADD_TO_SET,
    );
    return updateData;
  };

  static buildSetUpdateQuery = (data: Record<string, any>, prevKeys: string[] = []) => {
    const updateData = mongoQueryBuilder._buildUpdateQuery(
      data,
      {},
      prevKeys,
      ARRAY_HANDLE_METHOD.SET,
    );
    return updateData;
  };
}

export default mongoQueryBuilder;
