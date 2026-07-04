// Two sample meeting recordings, pre-transcribed. These stand in for the output of the
// speaker-diarized transcription provider and double as fixtures for the extraction pass.
// They are written in the exact plain-text format users can upload (.txt), so they also
// exercise the transcript parser.

export const demoMeetings = [
  {
    id: 'demo-hoa',
    label: 'Maplewood Commons HOA — Monthly Board Meeting',
    blurb: 'HOA board: treasurer’s report, pool resurfacing bids (4–1 vote with dissent), action items.',
    meta: {
      orgName: 'Maplewood Commons Homeowners Association',
      bodyName: 'Board of Directors',
      meetingType: 'Regular',
      date: '2026-07-01',
      location: 'Maplewood Commons Clubhouse',
      secretaryName: 'Maria Gonzalez',
    },
    transcript: `[00:00:05] Linda Park: Good evening, everyone. I call this meeting of the Maplewood Commons HOA Board of Directors to order at 7:03 PM.
[00:00:14] Linda Park: Let's do a quick roll call. Raj?
[00:00:17] Raj Patel: Here.
[00:00:19] Maria Gonzalez: Present.
[00:00:21] Tom Brennan: Here.
[00:00:23] Sue Ellison: Present.
[00:00:26] Linda Park: Dana Whitfield is absent tonight; she sends her regrets.
[00:00:34] Linda Park: First item is approval of the minutes from the June meeting. Everyone had a chance to read them?
[00:00:41] Tom Brennan: I move to approve the minutes of the June 2 meeting as distributed.
[00:00:46] Sue Ellison: Second.
[00:00:48] Linda Park: All in favor?
[00:00:50] All: Aye.
[00:00:52] Linda Park: Any opposed? Hearing none, the minutes are approved unanimously.
[00:01:02] Linda Park: Next item is the treasurer's report. Raj, go ahead.
[00:01:08] Raj Patel: Thanks, Linda. The operating account balance is $48,250 as of June 30, and the reserve fund sits at $112,400. We are about 4 percent under budget year to date, mostly because the irrigation repairs came in cheaper than quoted.
[00:01:32] Tom Brennan: Is the reserve still below the target from the reserve study?
[00:01:36] Raj Patel: It is. We are at about 62 percent funded against a 70 percent target, so I am recommending we keep the monthly reserve contribution at $3,500 through year end.
[00:01:51] Linda Park: Do I have a motion to accept the treasurer's report?
[00:01:55] Sue Ellison: So moved.
[00:01:57] Maria Gonzalez: Second.
[00:01:59] Linda Park: All in favor?
[00:02:01] All: Aye.
[00:02:03] Linda Park: That's unanimous. Thank you, Raj.
[00:02:10] Linda Park: Moving on to the pool resurfacing project. We received three bids for the work.
[00:02:18] Raj Patel: The bids came in at $28,900 from AquaTech Pools, $31,500 from Crestline Aquatics, and $26,000 from a third contractor who could not provide a current insurance certificate.
[00:02:36] Sue Ellison: I think we should go with AquaTech. They did the deck repair two years ago and the work held up well.
[00:02:44] Tom Brennan: My concern is that we are pulling this from reserves before the reserve study update. I would rather rebid in the fall.
[00:02:54] Linda Park: The pool is losing water daily, so waiting until fall risks a bigger repair. Is there a motion?
[00:03:02] Sue Ellison: I move that the board accept the AquaTech Pools bid for pool resurfacing in an amount not to exceed $30,000, funded from the reserve account.
[00:03:14] Raj Patel: Second.
[00:03:16] Linda Park: Any further discussion? All in favor?
[00:03:20] Sue Ellison: Aye.
[00:03:21] Raj Patel: Aye.
[00:03:22] Maria Gonzalez: Aye.
[00:03:24] Linda Park: Aye. Opposed?
[00:03:26] Tom Brennan: Opposed.
[00:03:28] Linda Park: The motion carries 4 to 1.
[00:03:33] Tom Brennan: I'd like the minutes to reflect, in my own words: I support the resurfacing project but object to funding it from reserves before the reserve study update is complete.
[00:03:45] Linda Park: Noted, Maria will enter that. Maria, can you also post the pool closure notice to residents by July 15?
[00:03:53] Maria Gonzalez: Yes, I will post the pool closure notice to the community portal by July 15.
[00:03:59] Linda Park: Raj will schedule the reserve study update with the consultant this month, and I will contact AquaTech to finalize the contract this week.
[00:04:12] Linda Park: Moving on to new business. Tom, you had the parking enforcement complaint?
[00:04:18] Tom Brennan: Yes. The owner of unit 14 reported repeated overnight parking violations in guest spaces, and our current towing policy is too vague to enforce consistently.
[00:04:30] Sue Ellison: We should look at the policy language before towing anyone.
[00:04:34] Linda Park: Agreed. Tom will draft a revised towing policy for review at the next meeting. No motion needed tonight.
[00:04:44] Linda Park: Is there any other business? Hearing none, do I have a motion to adjourn?
[00:04:50] Sue Ellison: So moved.
[00:04:52] Tom Brennan: Second.
[00:04:54] Linda Park: All in favor?
[00:04:56] All: Aye.
[00:04:58] Linda Park: The meeting is adjourned at 8:12 PM. Thanks, everyone.`,
  },
  {
    id: 'demo-nonprofit',
    label: 'Riverbend Community Foundation — Board of Directors',
    blurb: 'Nonprofit board: ED update, grant disbursement, gala venue vote with a conflict-of-interest abstention.',
    meta: {
      orgName: 'Riverbend Community Foundation',
      bodyName: 'Board of Directors',
      meetingType: 'Regular',
      date: '2026-06-24',
      location: 'Zoom (virtual meeting)',
      secretaryName: 'Elaine Foster',
    },
    transcript: `[00:00:04] Angela Torres: Good evening. I call this regular meeting of the Riverbend Community Foundation Board of Directors to order at 6:32 PM.
[00:00:13] Angela Torres: For the record, we have regrets from Howard Lin, who is traveling. Also with us tonight is our executive director, David Kim.
[00:00:24] Priya Shah: Present.
[00:00:26] Marcus Webb: Here.
[00:00:28] Elaine Foster: Present.
[00:00:32] Angela Torres: First item is approval of the minutes from the May meeting.
[00:00:37] Priya Shah: I move that the minutes of the May 27 meeting be approved as distributed.
[00:00:42] Marcus Webb: Second.
[00:00:44] Angela Torres: All in favor?
[00:00:46] All: Aye.
[00:00:48] Angela Torres: The minutes are approved unanimously.
[00:00:54] Angela Torres: Next item is the financial report. Priya?
[00:01:00] Priya Shah: Thank you. We closed May with $214,600 in total assets, and the spring appeal brought in $38,200 against a goal of $35,000. Program spending is tracking at 71 percent of the budget, which is right where we want to be at this point in the year.
[00:01:24] Angela Torres: Do I have a motion to accept the financial report?
[00:01:28] Marcus Webb: So moved.
[00:01:30] Elaine Foster: Second.
[00:01:32] Angela Torres: All in favor?
[00:01:34] All: Aye.
[00:01:36] Angela Torres: Carried unanimously.
[00:01:42] Angela Torres: Moving on to the youth literacy grant disbursement. David, can you give us the summary?
[00:01:49] David Kim: Sure. The grants committee reviewed six applications and recommends a $15,000 disbursement to the Eastside Reading Partners program, which serves about 120 students across three schools.
[00:02:06] Elaine Foster: The site visit report was very strong. Their volunteer retention is the best of the applicants we reviewed.
[00:02:14] Priya Shah: I move that the board approve a grant disbursement of $15,000 to Eastside Reading Partners from the youth literacy fund.
[00:02:24] Elaine Foster: Second.
[00:02:26] Angela Torres: Any discussion? All in favor?
[00:02:29] All: Aye.
[00:02:31] Angela Torres: The motion carries unanimously.
[00:02:38] Angela Torres: Last item is the fall gala venue. We need to lock a date and venue this month to hold the caterer.
[00:02:47] David Kim: The Harborview Ballroom quoted $6,800 for Saturday, October 17, which is $1,200 below last year's venue, and they can hold the date until July 10.
[00:02:59] Marcus Webb: Before we vote, I should note that my firm does consulting work for Harborview's parent company, so I will abstain from this one.
[00:03:08] Priya Shah: I move that the board approve booking the Harborview Ballroom for the fall gala on October 17 at a cost not to exceed $7,000.
[00:03:19] Elaine Foster: Second.
[00:03:21] Angela Torres: All in favor?
[00:03:23] Priya Shah: Aye.
[00:03:24] Elaine Foster: Aye.
[00:03:25] Angela Torres: Aye. Any opposed? None. Marcus Webb abstains due to a stated conflict of interest. The motion carries 3 to 0 with one abstention.
[00:03:38] Angela Torres: David will sign the venue agreement by July 10, and Elaine will send the save-the-date announcement to the mailing list by July 20.
[00:03:50] Angela Torres: Priya, can you bring the sponsorship pricing proposal to the next meeting?
[00:03:55] Priya Shah: Yes, I will prepare the sponsorship pricing proposal for the July meeting.
[00:04:01] Angela Torres: Anything else for the good of the order? Hearing nothing, do I have a motion to adjourn?
[00:04:08] Marcus Webb: So moved.
[00:04:10] Priya Shah: Second.
[00:04:12] Angela Torres: All in favor?
[00:04:14] All: Aye.
[00:04:16] Angela Torres: We are adjourned at 7:21 PM. Good night, everyone.`,
  },
];
