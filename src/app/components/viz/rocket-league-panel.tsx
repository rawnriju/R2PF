import { RocketLeagueChart } from "./rocket-league-chart";
import { RocketLeagueRundown } from "./rocket-league-rundown";

/** Two Rocket League questions sharing one card: where my rank is heading
    (tracker.gg session history) and what kind of player I am (last season's
    Rundown against the community average). */
export function RocketLeaguePanel() {
  return (
    <div className="mini-viz-panel">
      <div className="mini-viz-panel__col">
        <p className="mini-viz-panel__question">Am I actually climbing?</p>
        <RocketLeagueChart />
      </div>
      <div className="mini-viz-panel__col">
        <p className="mini-viz-panel__question">What kind of player am I?</p>
        <RocketLeagueRundown />
      </div>
    </div>
  );
}
