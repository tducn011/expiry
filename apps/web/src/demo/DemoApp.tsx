// ponytail: DemoApp delegates directly to App with demoMode variant, eliminating 420+ lines of duplicate orchestration

import App from "../App"

export default function DemoApp() {
  return <App demoMode={true} />
}
