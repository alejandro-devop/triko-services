import AsyncStorage from '@react-native-community/async-storage';
import {uuid} from 'uuidv4';

export const ENTITY_PREFIX = 'entity';
export const STORE_PREFIX = 'store';

/**
 * This class works as a persistence unit for async storage.
 *
 * @class StorageService
 */
class StorageService {
  /**
   * This function allows to get the entityName structure.
   * An entity stores data as a collection (array)
   * A store is just an object to store values.
   * @memberof StorageService
   */
  getEntityName = (entityName, isStore) =>
    `${isStore ? STORE_PREFIX : ENTITY_PREFIX}_${entityName}`;

  /**
   * This function allows to get a store object.
   * @param entity
   * @returns {Promise<V|*|R|{}>}
   */
  getStore = async entity => {
    try {
      const entityName = this.getEntityName(entity, true);
      const store = await AsyncStorage.getItem(entityName);
      if (store) {
        return JSON.parse(store);
      }
      return false;
    } catch (e) {
      throw e;
    }
  };

  /**
   * This function allows to initialize a new store.
   * a store don't need to be initialized before setting it value
   * you can just set it, if the store does not exists it is initialized.
   * @param entity
   * @param defaultValue
   * @returns {Promise<*|R|void>}
   */
  initStore = async (entity, defaultValue = {}) => {
    try {
      const entityName = this.getEntityName(entity, true);
      const store = await AsyncStorage.setItem(
        entityName,
        JSON.stringify(defaultValue),
      );
      return JSON.parse(store);
    } catch (e) {
      throw e;
    }
  };

  /**
   * This function allows to set a new store values.
   * @param entity
   * @param values
   * @returns {Promise<*|R|void>}
   */
  setStore = async (entity, values = {}) => {
    try {
      const entityName = this.getEntityName(entity, true);
      const store = await AsyncStorage.setItem(
        entityName,
        JSON.stringify(values),
      );
      return JSON.parse(store);
    } catch (e) {
      throw e;
    }
  };

  /**
   * This function allows to remove a store
   * @param entity
   * @returns {Promise<*|R|void>}
   */
  removeStore = async entity => {
    try {
      const entityName = this.getEntityName(entity, true);
      return await AsyncStorage.removeItem(entityName);
    } catch (e) {
      throw e;
    }
  };

  /**
   * This function allows to set the value to an existing store.
   * @param entity
   * @param key
   * @param value
   * @returns {Promise<*>}
   */
  setStoreKey = async (entity, key, value) => {
    try {
      const currentStore = await this.getStore(entity);
      currentStore[key] = value;
      await this.setStore(entity, currentStore);
      return currentStore;
    } catch (e) {
      throw e;
    }
  };

  /**
   * This function allows to remove a key from a particular storage.
   * @param entity
   * @param key
   * @returns {Promise<*>}
   */
  removeStoreKey = async (entity, key) => {
    try {
      const currentStore = await this.getStore(entity);
      currentStore[key] = null;
      delete currentStore[key];
      await this.setStore(entity, currentStore);
      return currentStore;
    } catch (e) {
      throw e;
    }
  };

  /**
   * This function allows to get an entity data from the storage.
   *
   * @memberof StorageService
   */
  getData = async (entityName, criteria = false, callback = false) => {
    try {
      const storageName = this.getEntityName(entityName);
      const data = await AsyncStorage.getItem(storageName, callback);
      if (criteria !== false) {
        return this.filterData(JSON.parse(data), criteria);
      } else {
        return JSON.parse(data);
      }
    } catch (err) {
      throw err;
    }
  };

  /**
   * This function allows to get all records inside an entity.
   * @param entity
   * @returns {Promise<*|boolean>}
   */
  getAll = async entity => {
    try {
      const records = await this.getData(entity);
      if (Array.isArray(records)) {
        return records;
      }
      return false;
    } catch (e) {
      throw e;
    }
  };

  /**
   * This function allows to store data in the storage.
   *
   * @memberof StorageService
   */
  persistData = async (entity, data = {}, callback = false) => {
    try {
      await AsyncStorage.setItem(
        this.getEntityName(entity),
        JSON.stringify(data),
        callback,
      );
      return true;
    } catch (err) {
      throw err;
    }
  };

  /**
   * This function allows to filter records using predefiend or custom condictions.
   *
   * @memberof StorageService
   */
  filterData = async (data = [], criteria = false) => {
    const criteriaKeys = Object.keys(criteria);
    if (!criteriaKeys) {
      return data;
    }
    let resultData = [...data];
    resultData = resultData.filter(record => {
      let isValid = true;
      criteriaKeys.forEach(key => {
        if (record[key] !== criteria[key]) {
          isValid = false;
        }
      });
      return isValid;
    });
    return resultData;
  };

  /**
   * This funciton allows to add new records to the database.
   *
   * @memberof StorageService
   */
  addRecord = async (entity, data = {}, callback) => {
    data.ui_code = uuid();
    try {
      const records = (await this.getData(entity)) || [];
      records.push(data);
      await this.persistData(entity, records, callback);
      return data;
    } catch (err) {
      throw err;
    }
  };

  /**
   * This function allows to get a single record using the id.
   * @param entity
   * @param id
   * @returns {Promise<boolean>}
   */
  getById = async (entity, id) => {
    try {
      const response = await this.getData(entity, {
        ui_code: id,
      });
      if (Array.isArray(response) && response.length > 0) {
        const [record] = response;
        return record;
      }
      return false;
    } catch (e) {
      throw e;
    }
  };

  /**
   * This function allows to get multiple records using a criteria.
   *
   * @memberof StorageService
   */
  findAll = async (entity, criteria = {}) => {
    try {
      return (await this.getData(entity, criteria)) || [];
    } catch (e) {
      throw e;
    }
  };

  /**
   * This function allows to get a single record using attributes as criteria.
   *
   * @memberof StorageService
   */
  findOneBy = async (entity, criteria = {}) => {
    try {
      const [record] = await this.findAll(entity, criteria);
      return record;
    } catch (e) {
      throw e;
    }
  };

  /**
   * This function allows to update a single record in the storage.
   *
   * @memberof StorageService
   */
  updateRecord = async (entity, newData = {}, callback) => {
    try {
      const {ui_code} = newData;
      if (!newData.ui_code) {
        throw new Error('Record does not exists');
      }
      const currentRecords = (await this.getData(entity)) || [];
      let recordIndex = null;
      let currentData = currentRecords.find((record, index) => {
        const found = record.ui_code === ui_code;
        if (found) {
          recordIndex = index;
        }
        return found;
      });
      currentData = {
        ...currentData,
        ...newData,
      };
      currentRecords[recordIndex] = currentData;
      return await this.persistData(entity, currentRecords, callback);
    } catch (err) {
      throw err;
    }
  };

  /**
   * This function allows to remove a record from the storage.
   *
   * @memberof StorageService
   */
  deleteRecord = async (entity, ui_code, callback) => {
    if (!ui_code) {
      throw 'Record does not exists';
    }
    try {
      let currentRecords = (await this.getData(entity)) || [];
      currentRecords = currentRecords.filter(
        record => record.ui_code !== ui_code,
      );
      return await this.persistData(entity, currentRecords, callback);
    } catch (err) {
      throw err;
    }
  };

  /**
   * This function allows to get all storage entities.
   *
   * @memberof StorageService
   */
  showEntities = async () => {
    return AsyncStorage.getAllKeys();
  };

  /**
   * This function allows to initialize an entity with empty values.
   * @param entity
   * @returns {Promise<{}>}
   */
  initEntity = async entity => {
    try {
      return await this.addRecord(entity, []);
    } catch (e) {
      throw e;
    }
  };

  /**
   * This function validates if an entity already exists.
   * @param entity
   * @returns {Promise<*>}
   */
  entityExists = async entity => {
    try {
      const entities = await this.showEntities();
      return entities.includes(entity);
    } catch (e) {
      throw e;
    }
  };

  /**
   * This Function allows to remove an entity from the storage.
   * @param entity
   * @returns {Promise<*|R|void>}
   */
  removeEntity = async entity => {
    try {
      await AsyncStorage.removeItem(this.getEntityName(entity));
      return true;
    } catch (e) {
      throw e;
    }
  };

  /**
   * This function allows to clear all data inside an entity
   * @param entity
   * @returns {Promise<boolean>}
   */
  clearEntity = async entity => {
    try {
      return await this.persistData(entity, []);
    } catch (e) {
      throw e;
    }
  };
}

export default new StorageService();
