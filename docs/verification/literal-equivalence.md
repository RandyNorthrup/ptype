# Literal extraction verification

Command: `node <temporary-helper>/ptype-verify-literals.mjs` using the locked TypeScript parser. Compare against baseline commit 4f4d77f after substituting immutable local configuration references back to their independently captured original numeric values. Remove only introduced configuration declarations. Normalize the equivalent nebula RGB data representation and explicit numeric useState annotation. Compare parsed node kinds, identifier/literal values, and ordered children, ignoring position metadata, comments, and JSX formatting whitespace. Functional modal, trivia, actor, game-loop, and live-targeting changes are excluded and covered by behavioral tests. Shared scoring/FPS references are substituted to their known original values; only the newly added imports are removed.

src/App.tsx: PASS; 6 immutable named values substitute to original literal syntax.

src/components/AchievementToast.tsx: PASS; 2 immutable named values substitute to original literal syntax.

src/components/CameraController.tsx: PASS; 5 immutable named values substitute to original literal syntax.

src/components/CanvasHUD.tsx: PASS; 1 immutable named values substitute to original literal syntax.

src/components/GameOverScreen.tsx: PASS; 1 immutable named values substitute to original literal syntax.

src/components/LaserEffect.tsx: PASS; 14 immutable named values substitute to original literal syntax.

src/components/MainMenu.tsx: PASS; 1 immutable named values substitute to original literal syntax.

src/components/PlayerStatsModal.tsx: PASS; 4 immutable named values substitute to original literal syntax.

src/components/SpaceScene.tsx: PASS; 37 immutable named values substitute to original literal syntax.

src/components/TriviaOverlay.tsx: PASS; 8 immutable named values substitute to original literal syntax.

src/components/TypingHandler.tsx: PASS; 2 immutable named values substitute to original literal syntax.

src/entities/PlayerShip.tsx: PASS; 3 immutable named values substitute to original literal syntax.

src/store/gameContext.tsx: PASS; 1 immutable named values substitute to original literal syntax.
