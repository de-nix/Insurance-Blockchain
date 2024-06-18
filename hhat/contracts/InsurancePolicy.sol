pragma solidity ^0.8.0;

contract InsurancePolicy {
    struct Policy {
        uint256 id;
        string policyName;
        address payable insurer;
        address payable insured;
        uint256 coverageAmount;
        uint256 premium;
        uint256 duration;
        uint256 creationTime;
        bool isAnswered;
        bool isAccepted;
        uint256 premiumDueDate;
        uint256 period;
    }

    struct Claim {
        uint256 id;
        uint256 policyId;
        string policyName;
        string description;
        uint256 amount;
        bool isAccepted;
        bool isAnswered;
    }

    Policy[] public policies;
    mapping(uint256 => Claim[]) public policyClaims;

    mapping(uint256 => uint256) public policyClaimCounters;
    uint256 public policyCounter;

    function createPolicy(
        string memory policyName,
        uint256 coverageAmount,
        uint256 premium,
        uint256 duration,
        uint256 period,
        address insuredAddress
    ) public {

        Policy memory newPolicy;

        newPolicy.id = policyCounter;
        newPolicy.policyName = policyName;
        newPolicy.insurer = payable(msg.sender);
        newPolicy.insured = payable(insuredAddress);
        newPolicy.coverageAmount = coverageAmount;
        newPolicy.premium = premium;
        newPolicy.duration = duration;
        newPolicy.creationTime = block.timestamp;
        newPolicy.isAnswered = false;
        newPolicy.isAccepted = false;
        newPolicy.period = period;
        newPolicy.premiumDueDate = block.timestamp;

        policies.push(newPolicy);

        emit PolicyCreated(policyCounter, policyName, msg.sender, insuredAddress, policies.length);

        policyCounter++;
    }
    function getPolicyCount() public view returns (uint256) {
        return policies.length;
    }


    function acceptPolicy(uint256 policyId) public payable {
        require(policies[policyId].insured == msg.sender, "Only the insured can accept the policy.");
        require(policies[policyId].premium == msg.value, "Incorrect premium amount.");
        require(!policies[policyId].isAnswered, "Can't answer a policy twice.");
        require(block.timestamp < policies[policyId].creationTime + policies[policyId].duration, "Policy is expired");

        policies[policyId].isAnswered = true;
        policies[policyId].isAccepted = true;
        payable(policies[policyId].insurer).transfer(msg.value);
        policies[policyId].premiumDueDate = block.timestamp + policies[policyId].period;

        emit PolicyAccepted(policyId);
    }

    function denyPolicy(uint256 policyId) public {
        require(!policies[policyId].isAnswered, "Can't answer a policy twice.");
        require(policies[policyId].insured == msg.sender, "Only the insured can deny a policy.");
        require(block.timestamp < policies[policyId].creationTime + policies[policyId].duration, "Policy is expired");

        policies[policyId].isAccepted = false;
        policies[policyId].isAnswered = true;
        emit PolicyDenied(policyId);
    }

    function fileClaim(
        uint256 policyId,
        string memory description,
        uint256 amount
    ) public {
        require(policyId<policyCounter, "Policy Id is out of range.");
        require(policies[policyId].isAccepted, "Policy is not accepted.");
        require(policies[policyId].insured == msg.sender, "Only the insured can file a claim.");
        require(block.timestamp < policies[policyId].creationTime + policies[policyId].duration, "Policy is expired");
        require(policies[policyId].premiumDueDate > block.timestamp, "Premium must be paid before filing a claim.");
        require(amount <= policies[policyId].coverageAmount, "Claim exceeds coverage amount.");

        Claim memory newClaim;

        uint256 claimId = policyClaimCounters[policyId]++;
        newClaim.id = claimId;
        newClaim.description = description;
        newClaim.amount = amount;
        newClaim.isAccepted = false;
        newClaim.isAnswered = false;
        newClaim.policyId = policyId;
        newClaim.policyName = policies[policyId].policyName;
        policyClaims[policyId].push(newClaim);

        emit ClaimFiled(newClaim.id ,policyId, description, amount);
    }

    function acceptAndPayClaim(uint256 policyId, uint256 claimId) public payable{

        require(policyId<policyCounter, "Policy Id is out of range.");
        require(claimId<policyClaimCounters[policyId], "Claim Id is out of range.");
        require(policies[policyId].insurer == msg.sender, "Only the insurer can accept a claim.");
        require(policies[policyId].coverageAmount >= policyClaims[policyId][claimId].amount, "Not enough coverage to accept the claim.");

        uint256 claimAmount = policyClaims[policyId][claimId].amount;

        policyClaims[policyId][claimId].isAccepted = true;
        policyClaims[policyId][claimId].isAnswered = true;
        policies[policyId].coverageAmount -= claimAmount;
        payable(policies[policyId].insured).transfer(claimAmount);

        emit ClaimAccepted(policyId, claimId);
    }

    function denyClaim(uint256 policyId, uint256 claimId) public {

        require(policyId<policyCounter, "Policy Id is out of range.");

        require(claimId<policyClaimCounters[policyId], "Claim Id is out of range.");
        require(policies[policyId].insurer == msg.sender, "Only the insurer can deny a claim.");

        policyClaims[policyId][claimId].isAccepted = false;
        policyClaims[policyId][claimId].isAnswered = true;
        emit ClaimDenied(policyId, claimId);
    }

    function getPolicy(uint256 policyId) public view returns (Policy memory) {
        require(policyId >= 0 && policyId < policies.length, "Invalid policy ID");
        require(policies[policyId].insurer == msg.sender || policies[policyId].insurer == msg.sender , "Only the insured or the insurer can access the policy.");
        Policy storage policy = policies[policyId];
        return policy;
    }


    function getAllPoliciesForAddress() public view returns (Policy[] memory) {
        uint256 count = 0;
        for (uint i = 0; i < policies.length; i++) {
            if (policies[i].insured == msg.sender || policies[i].insurer == msg.sender) {
                count++;
            }
        }

        Policy[] memory insuredPolicies = new Policy[](count);
        uint256 j = 0;
        for (uint i = 0; i < policies.length; i++) {
            if (policies[i].insured == msg.sender || policies[i].insurer == msg.sender) {
                insuredPolicies[j] = policies[i];
                j++;
            }
        }
        return insuredPolicies;
    }

    function getAllClaimsForAddress() public view returns (Claim[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < policies.length; i++) {
            if (policies[i].insurer == msg.sender || policies[i].insured == msg.sender) {
                count += policyClaims[i].length;
            }
        }

        Claim[] memory insurerClaims = new Claim[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < policies.length; i++) {
            if (policies[i].insurer == msg.sender || policies[i].insured == msg.sender) {
                for (uint256 j = 0; j < policyClaims[i].length; j++) {
                    insurerClaims[index] = policyClaims[i][j];
                    index++;
                }
            }
        }
        return insurerClaims;
    }


    function payPremium(uint256 policyId) public payable {
        require(policies[policyId].insured == msg.sender, "Only the insured can pay the premium.");
        require(policies[policyId].premium == msg.value, "Incorrect premium amount.");
        require(block.timestamp > policies[policyId].premiumDueDate, "Premium is already active.");
        require(policies[policyId].isAccepted, "Policy is not accepted.");
        require(block.timestamp < policies[policyId].creationTime + policies[policyId].duration, "Policy is expired");

        payable(policies[policyId].insurer).transfer(msg.value);
        policies[policyId].premiumDueDate = block.timestamp + policies[policyId].period;
        emit PremiumPaid(policyId, msg.value);
    }

    event PolicyCreated(uint256 id, string policyName, address insurer, address insured, uint256 policyCount);
    event ClaimFiled(uint256 claimId, uint256 policyId, string description, uint256 amount);
    event ClaimAccepted(uint256 policyId, uint256 claimId);
    event PolicyAccepted(uint256 policyId);
    event PolicyDenied(uint256 policyId);
    event ClaimDenied(uint256 policyId, uint256 claimId);
    event ClaimPaid(uint256 policyId, uint256 claimId);
    event PremiumPaid(uint256 policyId, uint256 amount);
}