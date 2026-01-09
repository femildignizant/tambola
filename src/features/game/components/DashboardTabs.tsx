"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { GameList } from "@/features/game/components/GameList";
import { GameHistoryList } from "@/features/game/components/GameHistoryList";
import { Gamepad2, History } from "lucide-react";

export function DashboardTabs() {
  return (
    <Tabs defaultValue="your-games" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
        <TabsTrigger
          value="your-games"
          className="flex items-center gap-2"
        >
          <Gamepad2 className="h-4 w-4" />
          Your Games
        </TabsTrigger>
        <TabsTrigger
          value="history"
          className="flex items-center gap-2"
        >
          <History className="h-4 w-4" />
          Game History
        </TabsTrigger>
      </TabsList>
      <TabsContent value="your-games">
        <GameList />
      </TabsContent>
      <TabsContent value="history">
        <GameHistoryList />
      </TabsContent>
    </Tabs>
  );
}
