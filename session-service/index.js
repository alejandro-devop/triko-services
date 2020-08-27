import StorageService from '../storage-service';
export const SESSION_STORE = 'session';

/**
 * This service works as an specific session manager.
 * @author Jorge Alejandro Quiroz Serna <jakop.box@gmail.com>
 */
class SessionService {
  session = null;
  /**
   * This function allows to initialize the session.
   * @param defaultSession
   * @returns {Promise<*|R|void>}
   */
  initialize = async (defaultSession = {}) => {
    try {
      let store = await this.read();
      if (!store) {
        store = await StorageService.initStore(SESSION_STORE, defaultSession);
      }
      this.session = store;
      // return (this.session = store);
      return true;
    } catch (e) {
      throw e;
    }
  };

  /**
   * This function allows to read session from the storage.
   * @returns {Promise<null>}
   */
  read = async () => {
    try {
      this.session = await StorageService.getStore(SESSION_STORE);
      return this.session;
    } catch (e) {
      throw e;
    }
  };

  /**
   * This function allows to write new data into the storage.
   * @param key
   * @param value
   * @returns {Promise<null>}
   */
  write = async (key, value) => {
    try {
      this.session = await StorageService.setStoreKey(
        SESSION_STORE,
        key,
        value,
      );
      return this.session;
    } catch (e) {
      throw e;
    }
  };

  /**
   * This function allows to write multiple keys inside the storage.
   * @param values
   * @returns {Promise<*|R|void>}
   */
  writeAll = async (values = {}) => {
    try {
      this.session = {
        ...this.session,
        ...values,
      };
      return await StorageService.setStore(SESSION_STORE, this.session);
    } catch (e) {
      throw e;
    }
  };

  /**
   * This function allows to remove a key from the session.
   * @param key
   * @returns {Promise<null>}
   */
  remove = async key => {
    try {
      await StorageService.removeStoreKey(SESSION_STORE, key);
      delete this.session[key];
      return this.session;
    } catch (e) {
      throw e;
    }
  };

  /**
   * This function allows to get any session key.
   * @param key
   * @param defaultValue
   * @returns {*}
   */
  get = (key, defaultValue = null) => {
    return this.session[key] || defaultValue;
  };

  /**
   * This function allows to get all session keys stored.
   * @returns {null}
   */
  getAll = () => this.session;
  clear = async (newData = {}) => {
    try {
      this.session = newData;
      return await StorageService.setStore(SESSION_STORE, newData);
    } catch (e) {
      throw e;
    }
  };
}

const Instance = new SessionService();

export default Instance;
