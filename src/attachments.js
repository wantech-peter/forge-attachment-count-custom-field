import api, { route } from "@forge/api"

async function setAttachmentsCount({attachmentsCount, issueIds, fieldKey}) {

    const response =await requestJira("PUT", route`/rest/api/2/app/field/${fieldKey}/value`, {
        updates: [{
            issueIds: issueIds,
            value: Number(attachmentsCount)
        }]
      });
    return response;
}

export async function setUpAttachmentCount(request) {
    const fieldKey = process.env.FIELD_KEY;
    const { startAt, maxResults } = JSON.parse(request.body || "{}");

    const attachmentCountExpressionResult = await requestJira("POST", route`/rest/api/2/expression/eval`, {
        expression: "issues.reduce((acc, i) => acc.set(i.attachments.length+'', (acc[i.attachments.length+''] || []).concat(i.id)), {})",
        context: {
            issues: {
                jql: {
                    query: "order by id",
                    startAt: startAt || 0,
                    maxResults: maxResults || 1000
                }
            }
        }
    });

    await Promise.all(
        Object.entries(attachmentCountExpressionResult.value)
            .map(([attachmentsCount, issueIds]) =>
                setAttachmentsCount({attachmentsCount, issueIds, fieldKey})
                    .then(() => console.log(`Set attachment count ${attachmentsCount} for issues: ${issueIds}.`))
            )
    );

    return {
        body: JSON.stringify({
            updatedIssues: attachmentCountExpressionResult.value,
            jql: attachmentCountExpressionResult.meta.issues.jql
        }),
        headers: {
            "Content-Type": ["application/json"]
        },
        statusCode: 200,
        statusText: "OK"
    };
}

export async function onIssueUpdate(event) {
    const fieldKey = process.env.FIELD_KEY;
    const issueId = event.issue.id;
    const attachmentsCount = await getCurrentAttachmentCount(issueId);
    const response = await setAttachmentsCount({attachmentsCount, issueIds: [issueId], fieldKey});
    console.log(`Updated the attachment count of issue ${issueId} to ${attachmentsCount} in fieldKey: ${fieldKey}`);
}

async function getCurrentAttachmentCount(issueId) {
    const result = await requestJira("POST", route`/rest/api/2/expression/eval`, {
        expression: "issue.attachments.length",
        context: {
            issue: {
                id: issueId
            }
        }
    });
    return result.value;
}

function requestJira(method, url, body) {
    console.log(`REQUEST: ${method} ${url}`, JSON.stringify(body));
    return api.asApp().requestJira(url, {
        method,
        body: JSON.stringify(body)
    }).then(r => r.json());
}
