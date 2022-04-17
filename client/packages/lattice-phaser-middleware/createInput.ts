import { bufferCount, filter, fromEvent, map, merge, Subject, throttleTime } from "rxjs";
import { observable, reaction, runInAction } from "mobx";

type Key = keyof typeof Phaser.Input.Keyboard.KeyCodes | "POINTER_LEFT" | "POINTER_RIGHT";

export function createInput(inputPlugin: Phaser.Input.InputPlugin) {
  const disposers = new Set<() => void>();
  const enabled = { current: true };

  function disableInput() {
    enabled.current = false;
  }

  function enableInput() {
    enabled.current = true;
  }

  const keyboard$ = new Subject<Phaser.Input.Keyboard.Key>();

  const pointermove$ = fromEvent(document, "mousemove").pipe(
    filter(() => enabled.current),
    map(() => inputPlugin.activePointer)
  );

  const pointerdown$ = fromEvent(document, "mousedown").pipe(
    filter(() => enabled.current),
    map(() => inputPlugin.activePointer)
  );

  const pointerup$ = fromEvent(document, "mouseup").pipe(
    filter(() => enabled.current),
    map(() => inputPlugin.activePointer)
  );

  // Double click stream
  const click$ = merge(pointerdown$, pointerup$).pipe(
    filter(() => enabled.current),
    map<Phaser.Input.Pointer, [boolean, number]>((pointer) => [pointer.leftButtonDown(), Date.now()]), // Map events to whether the left button is down and the current timestamp
    bufferCount(2, 1), // Store the last two timestamps
    filter(([prev, now]) => prev[0] && !now[0] && now[1] - prev[1] < 250), // Only care if button was pressed before and is not anymore and it happened within 500ms
    map(() => inputPlugin.activePointer) // Return the current pointer
  );

  // Double click stream
  const doubleClick$ = pointerdown$.pipe(
    filter(() => enabled.current),
    map(() => Date.now()), // Get current timestamp
    bufferCount(2, 1), // Store the last two timestamps
    filter(([prev, now]) => now - prev < 500), // Filter clicks with more than 500ms distance
    throttleTime(500), // A third click within 500ms is not counted as another double click
    map(() => inputPlugin.activePointer) // Return the current pointer
  );

  const pressedKeys = observable(new Set<Key>());
  const phaserKeyboard = inputPlugin.keyboard;
  const codeToKey = new Map<number, Key>();

  // Listen to all keys
  for (const key of Object.keys(Phaser.Input.Keyboard.KeyCodes)) addKey(key);

  // Subscriptions
  const keySub = keyboard$.subscribe((key) => {
    const keyName = codeToKey.get(key.keyCode);
    if (!keyName) return;
    runInAction(() => {
      if (key.isDown) pressedKeys.add(keyName);
      if (key.isUp) pressedKeys.delete(keyName);
    });
  });
  disposers.add(() => keySub?.unsubscribe());

  const pointerSub = merge(pointerdown$, pointerup$).subscribe((pointer) => {
    runInAction(() => {
      if (pointer.leftButtonDown()) pressedKeys.add("POINTER_LEFT");
      else pressedKeys.delete("POINTER_LEFT");

      if (pointer.rightButtonDown()) pressedKeys.add("POINTER_RIGHT");
      else pressedKeys.delete("POINTER_RIGHT");
    });
    //
  });
  disposers.add(() => pointerSub?.unsubscribe());

  // Adds a key to include in the state
  function addKey(key: string) {
    // Add the key to the phaser keyboard input plugin
    const keyObj = phaserKeyboard.addKey(key);
    // Store the cleartext key map
    codeToKey.set(keyObj.keyCode, key as Key);

    keyObj.removeAllListeners();
    keyObj.emitOnRepeat = true;
    keyObj.on("down", (keyEvent: Phaser.Input.Keyboard.Key) => keyboard$.next(keyEvent));
    keyObj.on("up", (keyEvent: Phaser.Input.Keyboard.Key) => keyboard$.next(keyEvent));
  }

  function onKeyPress(keySelector: (pressedKeys: Set<Key>) => boolean, callback: () => void) {
    const disposer = reaction(
      () => keySelector(pressedKeys),
      (passes) => {
        if (passes) callback();
      },
      { fireImmediately: true }
    );
    disposers.add(disposer);
  }

  function dispose() {
    for (const disposer of disposers) {
      disposer();
    }
  }

  return {
    keyboard$: keyboard$.asObservable(),
    pointermove$,
    pointerdown$,
    pointerup$,
    click$,
    doubleClick$,
    pressedKeys,
    dispose,
    phaserInputPlugin: inputPlugin,
    disableInput,
    enableInput,
    enabled,
    onKeyPress,
  };
}
