const { Octokit } = require('@octokit/rest');
const axios = require('axios');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Remplacez par un token valide
const EVERHOUR_API_TOKEN = process.env.EVERHOUR_API_TOKEN;

const context = {
  repo: {
    owner: process.env.GITHUB_REPOSITORY_OWNER,
    repo: process.env.GITHUB_REPOSITORY
  },
  payload: JSON.parse(process.env.GITHUB_EVENT_PAYLOAD)
};

try {
  console.log('Event received:', JSON.stringify(context.payload, null, 2));
  const issue = context.payload.issue;
  const label = context.payload.label.name;

  console.log('Issue:', issue);
  console.log('Label:', label);
  const now = new Date();
  const date_everhour = formatDate(now);
  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  let updatedBody = '';

  if (label === 'in progress' || label === 'review') {
    if (label === 'in progress') {
      updatedBody = (issue.body || '') + `\nDébut: ${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR')}`;
    }
    if (label === 'review') {
      updatedBody = (issue.body || '') + `\nDébut Review: ${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR')}`;
    }
    octokit.issues.update({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issue.number,
      body: updatedBody
    }).then(response => {
      console.log('Issue updated successfully:', response.data.html_url);
    }).catch(error => {
      console.error('Error updating issue:', error);
    });

    // Appel API pour démarrer le timer Everhour
    axios.post('https://api.everhour.com/timers', {
      task: `gh:${context.payload.issue.id}`,
      userDate: date_everhour,
      comment: '',
      action: 'start'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': EVERHOUR_API_TOKEN
      }
    }).then(response => {
      console.log('Timer started successfully:', response.data);
    }).catch(error => {
      console.error('Error starting timer:', error.response ? error.response.data : error.message);
    });
  }
} catch (error) {
  console.error('Error in script:', error);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
