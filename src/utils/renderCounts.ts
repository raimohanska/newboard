const renderCounts: Record<string, number> = {};

(window as any).renderCounts = renderCounts;

export function increaseRenderCount(componentName: string) {
  if (!renderCounts[componentName]) {
    renderCounts[componentName] = 0;
  }
  renderCounts[componentName]++;
  console.log(`Render ${componentName}`);
}