import { useEffect, useState } from "react";
import {
  getInitialPushState,
  registerForLunarPush,
  type PushRegistrationState
} from "../pwa/webPush";

const INITIAL_STATE: PushRegistrationState = {
  status: "checking",
  message: "Проверяю уведомления..."
};

function getButtonTitle(state: PushRegistrationState): string {
  if (state.status === "enabled") {
    return "Уведомления включены";
  }

  if (state.status === "registering") {
    return "Включаю...";
  }

  return "Напомнить в 12:00";
}

function isDisabled(state: PushRegistrationState): boolean {
  return (
    state.status === "checking" ||
    state.status === "registering" ||
    state.status === "enabled" ||
    state.status === "unsupported" ||
    state.status === "not-configured"
  );
}

export function NotificationPrompt() {
  const [state, setState] = useState<PushRegistrationState>(INITIAL_STATE);

  useEffect(() => {
    let mounted = true;

    void getInitialPushState().then((nextState) => {
      if (mounted) {
        setState(nextState);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleClick(): Promise<void> {
    setState({
      status: "registering",
      message: "Разреши уведомления в системном окне."
    });

    setState(await registerForLunarPush());
  }

  return (
    <button
      className={`notification-prompt notification-prompt--${state.status}`}
      disabled={isDisabled(state)}
      onClick={() => void handleClick()}
      type="button"
    >
      <span className="notification-prompt__copy">
        <span className="notification-prompt__title">{getButtonTitle(state)}</span>
        <span className="notification-prompt__message">{state.message}</span>
      </span>
      <span className="notification-prompt__badge">{state.status === "enabled" ? "ON" : "12"}</span>
    </button>
  );
}
