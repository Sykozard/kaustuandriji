import { Switch, Route, Router as WouterRouter } from "wouter";
import { Providers } from "@/components/providers";
import { Dashboard } from "@/components/dashboard";
import { Scrapbook } from "@/components/scrapbook";
import { LoveVault } from "@/components/love-vault";
import { MusicRoom } from "@/components/music-room";
import { MissingYou } from "@/components/missing-you";
import { KissesForYou } from "@/components/kisses-for-you";
import { Future } from "@/components/future";
import { Wishlist } from "@/components/wishlist";
import { MessageJar } from "@/components/message-jar";
import { SharedCalendar } from "@/components/shared-calendar";
import { DrawTogether } from "@/components/draw-together";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Providers>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/scrapbook" component={Scrapbook} />
        <Route path="/vault" component={LoveVault} />
        <Route path="/music" component={MusicRoom} />
        <Route path="/missing-you" component={MissingYou} />
        <Route path="/kisses" component={KissesForYou} />
        <Route path="/future" component={Future} />
        <Route path="/wishlist" component={Wishlist} />
        <Route path="/jar" component={MessageJar} />
        <Route path="/calendar" component={SharedCalendar} />
        <Route path="/draw" component={DrawTogether} />
        <Route component={NotFound} />
      </Switch>
    </Providers>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;