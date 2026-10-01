/**
 * Vercel Serverless Function: /api/github-contributions
 * Fetches real GitHub profile & contribution data for Ashutosh0128.
 *
 * Architecture:
 * 1. If GITHUB_TOKEN is available, queries GitHub GraphQL API.
 * 2. If GITHUB_TOKEN is not provided, fetches public data directly from github.com/users/Ashutosh0128/contributions
 *    and the GitHub REST API (no auth required for public profile/repos).
 * 3. Never exposes secrets or tokens to the frontend.
 * 4. Caches response with Cache-Control headers.
 */

const https = require('https');

function httpsRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
            });
        });
        req.on('error', reject);
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

// Format date string to "Sep 18, 2026"
function formatDate(dateStr) {
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        return dateStr;
    } catch {
        return dateStr;
    }
}

// 1. Fetch via GitHub GraphQL API if GITHUB_TOKEN is present
async function fetchViaGraphQL(username, token) {
    const query = `
    query($login: String!) {
      user(login: $login) {
        name
        login
        avatarUrl
        createdAt
        repositories(privacy: PUBLIC) {
          totalCount
        }
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                contributionLevel
                date
                color
              }
            }
          }
        }
      }
    }
    `;

    const postData = JSON.stringify({ query, variables: { login: username } });
    const response = await httpsRequest({
        hostname: 'api.github.com',
        path: '/graphql',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'Portfolio-GitHub-Fetcher',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    }, postData);

    if (response.statusCode !== 200) {
        throw new Error(`GraphQL request failed with status ${response.statusCode}`);
    }

    const json = JSON.parse(response.body);
    if (json.errors || !json.data || !json.data.user) {
        throw new Error(json.errors ? json.errors[0].message : 'User not found in GraphQL');
    }

    const user = json.data.user;
    const calendar = user.contributionsCollection.contributionCalendar;

    // Convert weeks and map contribution levels
    const levelMap = {
        'NONE': 0,
        'FIRST_QUARTILE': 1,
        'SECOND_QUARTILE': 2,
        'THIRD_QUARTILE': 3,
        'FOURTH_QUARTILE': 4
    };

    const weeks = calendar.weeks.map(week => ({
        contributionDays: week.contributionDays.map(day => ({
            date: day.date,
            count: day.contributionCount,
            level: levelMap[day.contributionLevel] !== undefined ? levelMap[day.contributionLevel] : 0,
            tooltip: `${day.contributionCount === 0 ? 'No' : day.contributionCount} contribution${day.contributionCount === 1 ? '' : 's'} on ${formatDate(day.date)}`
        }))
    }));

    return {
        username: user.login,
        name: user.name || user.login,
        avatarUrl: user.avatarUrl,
        publicRepos: user.repositories ? user.repositories.totalCount : null,
        activeSince: user.createdAt ? new Date(user.createdAt).getFullYear() : null,
        totalContributions: calendar.totalContributions,
        weeks
    };
}

// 2. Fetch via Public GitHub HTML and Public REST API (Fallback when GITHUB_TOKEN is not configured)
async function fetchViaPublicGitHub(username) {
    // A. Fetch contributions HTML from github.com
    const contribRes = await httpsRequest({
        hostname: 'github.com',
        path: `/users/${username}/contributions`,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html'
        }
    });

    if (contribRes.statusCode !== 200) {
        throw new Error(`Failed to fetch GitHub public contributions HTML (${contribRes.statusCode})`);
    }

    const html = contribRes.body;

    // Parse total contributions
    const totalMatch = html.match(/([0-9,]+)\s+contributions?\s+in\s+the\s+last\s+year/i);
    const totalContributions = totalMatch ? parseInt(totalMatch[1].replace(/,/g, ''), 10) : 0;

    // Parse tooltips
    const tipRegex = /<tool-tip[^>]*for="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g;
    let tipMatch;
    const tooltips = {};
    while ((tipMatch = tipRegex.exec(html)) !== null) {
        tooltips[tipMatch[1]] = tipMatch[2].trim();
    }

    // Parse table days
    const dayRegex = /data-date="([^"]+)"[^>]*id="([^"]+)"[^>]*data-level="([^"]+)"/g;
    let dayMatch;
    const days = [];
    while ((dayMatch = dayRegex.exec(html)) !== null) {
        const date = dayMatch[1];
        const id = dayMatch[2];
        const level = parseInt(dayMatch[3], 10) || 0;
        const tipText = tooltips[id] || '';

        // Extract count from tooltip (e.g. "5 contributions on...", "No contributions on...")
        let count = 0;
        const countMatch = tipText.match(/^([0-9]+)\s+contribution/i);
        if (countMatch) {
            count = parseInt(countMatch[1], 10);
        } else if (/^No\s+contribution/i.test(tipText)) {
            count = 0;
        } else if (level > 0) {
            count = level;
        }

        const tooltip = `${count === 0 ? 'No' : count} contribution${count === 1 ? '' : 's'} on ${formatDate(date)}`;

        days.push({ date, level, count, tooltip });
    }

    // Sort days chronologically by date
    days.sort((a, b) => a.date.localeCompare(b.date));

    // Group days into weeks of Sunday to Saturday
    const weeks = [];
    let currentWeek = [];
    days.forEach((day, index) => {
        currentWeek.push(day);
        const dayOfWeek = new Date(day.date + 'T00:00:00').getDay();
        if (dayOfWeek === 6 || index === days.length - 1) {
            weeks.push({ contributionDays: currentWeek });
            currentWeek = [];
        }
    });

    // B. Fetch public user profile and repository languages from GitHub REST API
    let publicRepos = null;
    let activeSince = null;
    let languages = [];
    let avatarUrl = '';
    let name = '';

    try {
        const userRes = await httpsRequest({
            hostname: 'api.github.com',
            path: `/users/${username}`,
            method: 'GET',
            headers: { 'User-Agent': 'Portfolio-App' }
        });

        if (userRes.statusCode === 200) {
            const userData = JSON.parse(userRes.body);
            publicRepos = userData.public_repos;
            avatarUrl = userData.avatar_url;
            name = userData.name || username;
            if (userData.created_at) {
                activeSince = new Date(userData.created_at).getFullYear();
            }
        }

        // Fetch top languages from repositories
        const reposRes = await httpsRequest({
            hostname: 'api.github.com',
            path: `/users/${username}/repos?per_page=100`,
            method: 'GET',
            headers: { 'User-Agent': 'Portfolio-App' }
        });

        if (reposRes.statusCode === 200) {
            const repos = JSON.parse(reposRes.body);
            const langCounts = {};
            repos.forEach(repo => {
                if (repo.language) {
                    langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
                }
            });
            languages = Object.entries(langCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(entry => entry[0]);
        }
    } catch {
        // Non-critical, continue with what we have
    }

    return {
        username,
        name: name || username,
        avatarUrl,
        publicRepos,
        activeSince,
        primaryLanguages: languages.length > 0 ? languages.join(', ') : 'Python, JavaScript, HTML, CSS',
        totalContributions,
        weeks
    };
}

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const username = (req.query && req.query.username) || 'Ashutosh0128';
    const token = process.env.GITHUB_TOKEN;

    // Set cache control: 1 hour on CDN edge, 24 hours stale revalidation
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', 'application/json');

    try {
        let data;
        if (token) {
            try {
                data = await fetchViaGraphQL(username, token);
            } catch (graphqlErr) {
                console.warn('GraphQL fetch failed, falling back to public GitHub scrape:', graphqlErr.message);
                data = await fetchViaPublicGitHub(username);
            }
        } else {
            data = await fetchViaPublicGitHub(username);
        }

        res.status(200).json({
            success: true,
            source: token ? 'github-graphql' : 'github-public',
            ...data
        });
    } catch (err) {
        console.error('Error fetching GitHub data:', err);
        res.status(500).json({
            success: false,
            error: 'GitHub activity unavailable',
            profileUrl: `https://github.com/${username}`
        });
    }
};
