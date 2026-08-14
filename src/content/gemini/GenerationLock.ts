export class GenerationLock {
  private locked = false;

  async acquire(sceneId: string): Promise<void> {
    console.log(`[Novel2Visual] GENERATION LOCK | Scene ${sceneId} → waiting`);
    
    while (this.locked) {
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    this.locked = true;
    console.log(`[Novel2Visual] GENERATION LOCK | Scene ${sceneId} → acquired`);
  }

  release(sceneId: string): void {
    this.locked = false;
    console.log(`[Novel2Visual] GENERATION LOCK | Scene ${sceneId} → released`);
  }
}
