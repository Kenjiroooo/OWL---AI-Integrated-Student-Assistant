import fs from 'fs';

const content = fs.readFileSync('src/components/features/campusNav/MainCampusInteractiveMap.tsx', 'utf-8');

function parsePoints(str) {
  return str.split(/\s+/).map(p => {
    const [x,y] = p.split(',').map(Number);
    return {x,y};
  });
}

function getSqSegDist(p, p1, p2) {
  let x = p1.x, y = p1.y, dx = p2.x - x, dy = p2.y - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = p2.x; y = p2.y;
    } else if (t > 0) {
      x += dx * t; y += dy * t;
    }
  }
  dx = p.x - x; dy = p.y - y;
  return dx * dx + dy * dy;
}

function simplifyDPStep(points, first, last, sqTolerance, simplified) {
  let maxSqDist = sqTolerance;
  let index = -1;
  for (let i = first + 1; i < last; i++) {
    const sqDist = getSqSegDist(points[i], points[first], points[last]);
    if (sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }
  if (index > -1) {
    if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
    simplified.push(points[index]);
    if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
  }
}

function simplifyDouglasPeucker(points, tolerance) {
  if (points.length <= 2) return points;
  const sqTolerance = tolerance * tolerance;
  const simplified = [points[0]];
  simplifyDPStep(points, 0, points.length - 1, sqTolerance, simplified);
  simplified.push(points[points.length - 1]);
  return simplified;
}

const match1 = content.match(/id: 'admin-building'[\s\S]*?points: '([^']+)'/);
const match2 = content.match(/id: 'v-building'[\s\S]*?points: '([^']+)'/);

if (match1 && match2) {
  const p1 = parsePoints(match1[1]);
  const p2 = parsePoints(match2[1]);
  
  const tol = 10; 
  
  const sim1 = simplifyDouglasPeucker(p1, tol).map(p => Math.round(p.x) + ',' + Math.round(p.y)).join(' ');
  const sim2 = simplifyDouglasPeucker(p2, tol).map(p => Math.round(p.x) + ',' + Math.round(p.y)).join(' ');
  
  console.log('ADMIN:');
  console.log(sim1);
  console.log('V-BUILDING:');
  console.log(sim2);
}
