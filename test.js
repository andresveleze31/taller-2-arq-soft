import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10, // 10 usuarios virtuales
  duration: '10s',
};

export default function () {
  let res = http.get('http://localhost:5000/location-http');
  check(res, {
    'status was 200': (r) => r.status === 200,
  });
  sleep(1);
}

