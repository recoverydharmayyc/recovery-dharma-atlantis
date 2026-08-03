import { Component, type ErrorInfo, type ReactNode } from "react";
import { SITE } from "../content/site";

type Props = { children: ReactNode };
type State = { failed: boolean };

export function AppErrorFallback() {
  return (
    <div className="app-error-shell" data-demo-state="fictional">
      <main className="app-error" aria-labelledby="app-error-title">
        <p className="app-error-label">{SITE.fictionalLabel}</p>
        <h1 id="app-error-title">This page could not be displayed.</h1>
        <p>Reload the page to try again. No message or personal information was sent.</p>
        <button type="button" onClick={() => window.location.reload()}>
          Reload page
        </button>
        <p className="app-error-notice">{SITE.footerNotice}</p>
      </main>
    </div>
  );
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // The public starter has no logging or analytics endpoint.
  }

  render() {
    return this.state.failed ? <AppErrorFallback /> : this.props.children;
  }
}
