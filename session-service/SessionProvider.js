import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import SessionService from 'shared/services/session-service';
import LoaderScreen from 'shared/components/loaders/loader-screen';
import useSession from 'hooks/useSession';

/**
 * This Component allows to rehydrate the session storage from AsyncStorage.
 * @author Jako <jakop.box@gmail.com>
 * @param children
 * @returns {*}
 * @constructor
 */
const SessionProvider = ({children}) => {
  const [loaded, setLoaded] = useState(false);
  const {setAll} = useSession();
  const initializeSession = async () => {
    try {
      await SessionService.initialize();
      const session = await SessionService.getAll();
      await setAll(session);
      setLoaded(true);
    } catch (e) {
      console.log('e: ', e);
    }
  };
  useEffect(() => {
    initializeSession();
  }, []);
  return loaded ? children : <LoaderScreen />;
};

SessionProvider.propTyprs = {
  children: PropTypes.node,
};

export default SessionProvider;
