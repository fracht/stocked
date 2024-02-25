const { danger, fail } = require('danger');

const changesets = danger.git.fileMatch('.changeset/*.md');

if (!changesets.created) {
	fail('No changesets has been added in you pull request!');
}
