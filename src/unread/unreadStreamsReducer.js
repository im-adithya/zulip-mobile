/* @flow strict-local */
import type { Action, GlobalState } from '../types';
import type { UnreadStreamsState } from './unreadModelTypes';
import {
  REALM_INIT,
  LOGOUT,
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../actionConstants';
import { addItemsToStreamArray, removeItemsDeeply } from './unreadHelpers';
import { NULL_ARRAY } from '../nullObjects';
import { getOwnUserId } from '../users/userSelectors';

const initialState: UnreadStreamsState = NULL_ARRAY;

const eventNewMessage = (state, action, globalState) => {
  if (action.message.type !== 'stream') {
    return state;
  }

  if (getOwnUserId(globalState) === action.message.sender_id) {
    return state;
  }

  return addItemsToStreamArray(
    state,
    [action.message.id],
    action.message.stream_id,
    action.message.subject,
  );
};

const eventUpdateMessageFlags = (state, action) => {
  if (action.flag !== 'read') {
    return state;
  }

  if (action.all) {
    return initialState;
  }

  if (action.operation === 'add') {
    return removeItemsDeeply(state, action.messages);
  } else if (action.operation === 'remove') {
    // we do not support that operation
  }

  return state;
};

export default (
  state: UnreadStreamsState = initialState,
  action: Action,
  globalState: GlobalState,
): UnreadStreamsState => {
  switch (action.type) {
    case LOGOUT:
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return (action.data.unread_msgs && action.data.unread_msgs.streams) || initialState;

    case EVENT_NEW_MESSAGE:
      return eventNewMessage(state, action, globalState);

    case EVENT_MESSAGE_DELETE:
      return removeItemsDeeply(state, action.messageIds);

    case EVENT_UPDATE_MESSAGE_FLAGS:
      return eventUpdateMessageFlags(state, action);

    default:
      return state;
  }
};
