// Formatted-minutes generator: structured extraction -> Robert's Rules document (HTML).
// Passive voice, third person, actions not speech. This renders ONLY the distilled record;
// the transcript never leaks into this output.

export function generateMinutesHtml(extracted, settings) {
  const { metadata: md, attendance: att, priorMinutes, items, actionItems, adjournMotion } = extracted;
  const org = esc(md.orgName || settings.orgName || 'Organization');
  const body = esc(md.bodyName || settings.bodyName || 'Board of Directors');
  const type = esc(md.meetingType || 'Regular');
  const parts = [];

  parts.push(`<h1>${org}</h1>`);
  parts.push(`<p class="doc-sub">Minutes of the ${type} Meeting of the ${body}</p>`);
  parts.push(`<p class="doc-sub2">${esc(fmtDate(md.date))}${md.location ? ' · ' + esc(md.location) : ''}</p>`);

  parts.push(`<h2>Call to Order</h2>`);
  parts.push(
    `<p>The ${type.toLowerCase()} meeting of the ${body} of ${org} was called to order` +
      (md.calledToOrder ? ` at ${esc(md.calledToOrder)}` : '') +
      (att.chair ? ` by ${esc(att.chair)}, who presided` : '') +
      `.${att.secretary ? ` ${esc(att.secretary)} recorded the minutes.` : ''}</p>`
  );

  parts.push(`<h2>Attendance</h2>`);
  parts.push(`<p><strong>Present:</strong> ${att.present.map(esc).join(', ') || '—'}</p>`);
  if (att.absent.length) parts.push(`<p><strong>Absent:</strong> ${att.absent.map(esc).join(', ')}</p>`);
  if (att.alsoPresent.length) parts.push(`<p><strong>Also present:</strong> ${att.alsoPresent.map(esc).join(', ')}</p>`);
  parts.push(`<p>${att.quorum ? 'A quorum was present.' : 'A quorum was <strong>not</strong> established.'}</p>`);

  if (priorMinutes) {
    parts.push(`<h2>Approval of Minutes</h2>`);
    parts.push(motionParagraph(priorMinutes.motion, settings));
  }

  for (const item of items) {
    parts.push(`<h2>${esc(item.title)}</h2>`);
    if (item.discussion.length) parts.push(`<p>${item.discussion.map(esc).join(' ')}</p>`);
    for (const m of item.motions) parts.push(motionParagraph(m, settings));
    if (!item.motions.length && item.discussion.length) {
      parts.push(`<p class="no-action">No action was taken on this item.</p>`);
    }
    for (const v of item.verbatim) {
      parts.push(
        `<p class="verbatim">At the request of ${esc(v.speaker)}, the following statement was entered into the minutes verbatim: ` +
          `&ldquo;${esc(v.quote)}&rdquo;</p>`
      );
    }
  }

  if (actionItems.length) {
    parts.push(`<h2>Action Items</h2>`);
    parts.push(`<table class="actions"><thead><tr><th>Task</th><th>Owner</th><th>Due</th></tr></thead><tbody>`);
    for (const a of actionItems) {
      parts.push(`<tr><td>${esc(a.task)}</td><td>${esc(a.owner)}</td><td>${esc(a.due) || '—'}</td></tr>`);
    }
    parts.push(`</tbody></table>`);
  }

  parts.push(`<h2>Adjournment</h2>`);
  if (adjournMotion) {
    parts.push(
      `<p>It was moved by ${esc(adjournMotion.mover)}${adjournMotion.seconder ? ` and seconded by ${esc(adjournMotion.seconder)}` : ''} ` +
        `that the meeting be adjourned. ${voteSentence(adjournMotion.vote, settings)}</p>`
    );
  }
  parts.push(`<p>There being no further business, the meeting was adjourned${md.adjournedAt ? ` at ${esc(md.adjournedAt)}` : ''}.</p>`);

  parts.push(
    `<div class="signature"><p>Respectfully submitted,</p><p class="sig-line">&nbsp;</p>` +
      `<p>${esc(att.secretary || '____________________')}, Secretary</p>` +
      `<p class="approval">These minutes were approved by the ${body} on: ____________________</p></div>`
  );

  return parts.join('\n');
}

function motionParagraph(m, settings) {
  const moved = `<strong>MOTION:</strong> It was moved by ${esc(m.mover)}` +
    (m.seconder ? ` and seconded by ${esc(m.seconder)}` : '') +
    ` ${esc(m.text)}.`;
  return `<p class="motion">${moved} ${voteSentence(m.vote, settings)}</p>`;
}

function voteSentence(vote, settings) {
  if (!vote) return '';
  const verb = vote.passed === false ? 'failed' : 'carried';
  let s;
  if (vote.type === 'count' && vote.for !== null && vote.against !== null) {
    s = `The motion ${verb} ${vote.for}&ndash;${vote.against}`;
    if (vote.abstain) s += `, with ${vote.abstain} abstention${vote.abstain > 1 ? 's' : ''}`;
    s += '.';
  } else if (vote.unanimous && settings.voteDisplay !== 'counts') {
    s = `The motion ${verb} unanimously.`;
  } else if (vote.passed === null) {
    s = `<span class="needs-review">[Vote result unclear — please review.]</span>`;
  } else {
    s = `The motion ${verb}${vote.abstain ? `, with ${vote.abstain} abstention${vote.abstain > 1 ? 's' : ''}` : ''}.`;
  }
  if (settings.nameDissent) {
    const notes = [];
    if (vote.dissenters.length) notes.push(`Opposed: ${vote.dissenters.map(esc).join(', ')}`);
    if (vote.abstainers.length) notes.push(`Abstained: ${vote.abstainers.map(esc).join(', ')}`);
    if (notes.length) s += ` (${notes.join('; ')}.)`;
  }
  return s;
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
