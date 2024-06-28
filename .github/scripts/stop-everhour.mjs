
import { Octokit } from '@octokit/rest';
import axios from 'axios';

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
    const label = context.payload.label.name;

    if (label === 'wait_review' || label ==='done') {

        // Function to list running timers
        const listRunningTimers = async () => {
            try {
                const response = await axios.delete(
                  `https://api.everhour.com/timers/current`,
                  {
                    headers: {
                      'X-Api-Key': EVERHOUR_API_TOKEN,
                      'Content-Type': 'application/json'
                    }
                  }
                );
                console.log('Timer stopped successfully:', response.data);
              } catch (error) {
                console.error('Error stopping the timer:', error.response ? error.response.data : error.message);
              }
        };

        // Call the function to list running timers
        listRunningTimers();

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