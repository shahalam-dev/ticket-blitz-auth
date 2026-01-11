import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuration: 50 virtual users trying to login at once
export const options = {
    vus: 50, // Virtual Users
    duration: '10s', // Run for 10 seconds
};

export default function () {
    const url = 'http://host.docker.internal:3000/api/v1/auth/login';

    // NOTE: You must use a valid user from your DB here
    const payload = JSON.stringify({
        email: 'test1@example.com',
        password: 'supersecurepassword',
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = http.post(url, payload, params);

    // Assertions
    check(res, {
        'is status 200': (r) => r.status === 200,
        'response time < 200ms': (r) => r.timings.duration < 200,
    });

    sleep(1);
}

// docker run --rm -i grafana/k6 run - < load-test.js