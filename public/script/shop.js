import { spendPoints, getPoints } from './db.js';

document.addEventListener('DOMContentLoaded', () => {
  const buyButtons = document.querySelectorAll('.buy-btn');

  buyButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const item = button.closest('.shop-item');
      const label = item.querySelector('.shop-label').textContent;
      const cost = parseInt(item.querySelector('.cost').textContent);

      const success = await spendPoints(cost);

      if (success) {
        alert(`✅ Kupiono: ${label} za ${cost} punktów`);
        updatePointsDisplay();
      } else {
        alert(`❌ Za mało punktów na: ${label} (${cost})`);
      }
    });
  });
});

async function updatePointsDisplay() {
  const points = await getPoints();
  const pointsCount = document.getElementById('points-count');
  if (pointsCount) pointsCount.textContent = `${points}`;
}