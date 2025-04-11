import React from 'react';

const StepByStepGuide = ({ type }) => {
  const guides = {
    deploy: [
      {
        step: 1,
        title: "Add Shield Members",
        description: "Enter the wallet addresses of all members who will share control of the Shield. Each member will have equal rights to propose and vote on actions."
      },
      {
        step: 2,
        title: "Set Required Approvals",
        description: "Choose how many members must approve for any action to pass. This number must be between 1 and the total number of members."
      },
      {
        step: 3,
        title: "Set Voting Time",
        description: "Define how long members have to vote on proposals (in hours). After this time, proposals that don't reach enough approvals will expire."
      },
      {
        step: 4,
        title: "Create Shield",
        description: "Click 'Create Shield' to deploy your MultiGuard contract. You'll need to confirm the transaction in your wallet and pay the network fee."
      }
    ],
    migrate: [
      {
        step: 1,
        title: "Enter Contract Details",
        description: "Input your contract's address and ABI. The ABI should include the 'owner' and 'transferOwnership' functions."
      },
      {
        step: 2,
        title: "Verify Contract",
        description: "Click 'Check Contract' to verify the contract exists and you are the owner."
      },
      {
        step: 3,
        title: "Transfer Ownership",
        description: "Click 'Transfer to Shield' to transfer ownership to your MultiGuard Shield."
      }
    ],
    manage: [
      {
        step: 1,
        title: "Load Your Shield",
        description: "Enter your MultiGuard Shield's address to load its details and access management features."
      },
      {
        step: 2,
        title: "View Shield Details",
        description: "Review current Shield information: members list, required approvals, voting time, and active/pending proposals."
      },
      {
        step: 3,
        title: "Create New Proposals",
        description: "Initiate new proposals for various actions: transactions, adding/removing members, changing settings, or executing contract functions."
      },
      {
        step: 4,
        title: "Transaction Proposals",
        description: "Create proposals to send tokens, interact with contracts, or execute any blockchain transaction through your Shield."
      },
      {
        step: 5,
        title: "Member Management",
        description: "Propose adding new members or removing existing ones. Changes to membership require approval from other members."
      },
      {
        step: 6,
        title: "Shield Settings",
        description: "Propose changes to required approvals, voting time, or other Shield settings. All changes need member approval."
      },
      {
        step: 7,
        title: "Vote on Proposals",
        description: "Review pending proposals and cast your vote (approve/reject). Proposals execute automatically when they receive enough approvals."
      },
      {
        step: 8,
        title: "Monitor Status",
        description: "Track proposal status, voting progress, and execution results. Expired or rejected proposals can be viewed in the history."
      }
    ]
  };

  const currentGuide = guides[type] || [];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border border-blue-100">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">How it works</h3>
      <div className="space-y-5">
        {currentGuide.map((step) => (
          <div key={step.step} className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold border border-blue-200">
              {step.step}
            </div>
            <div className="ml-4 flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">{step.title}</h4>
              <p className="text-sm text-blue-700 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepByStepGuide; 