/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createCheckin = /* GraphQL */ `
  mutation CreateCheckin(
    $input: CreateCheckinInput!
    $condition: ModelCheckinConditionInput
  ) {
    createCheckin(input: $input, condition: $condition) {
      id
      name
      phone
      postcode
      photo {
        bucket
        region
        key
      }
      movements {
        items {
          id
          title
          checkinID
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const updateCheckin = /* GraphQL */ `
  mutation UpdateCheckin(
    $input: UpdateCheckinInput!
    $condition: ModelCheckinConditionInput
  ) {
    updateCheckin(input: $input, condition: $condition) {
      id
      name
      phone
      postcode
      photo {
        bucket
        region
        key
      }
      movements {
        items {
          id
          title
          checkinID
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const deleteCheckin = /* GraphQL */ `
  mutation DeleteCheckin(
    $input: DeleteCheckinInput!
    $condition: ModelCheckinConditionInput
  ) {
    deleteCheckin(input: $input, condition: $condition) {
      id
      name
      phone
      postcode
      photo {
        bucket
        region
        key
      }
      movements {
        items {
          id
          title
          checkinID
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const createMovement = /* GraphQL */ `
  mutation CreateMovement(
    $input: CreateMovementInput!
    $condition: ModelMovementConditionInput
  ) {
    createMovement(input: $input, condition: $condition) {
      id
      title
      checkinID
      checkin {
        id
        name
        phone
        postcode
        photo {
          bucket
          region
          key
        }
        movements {
          nextToken
        }
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const updateMovement = /* GraphQL */ `
  mutation UpdateMovement(
    $input: UpdateMovementInput!
    $condition: ModelMovementConditionInput
  ) {
    updateMovement(input: $input, condition: $condition) {
      id
      title
      checkinID
      checkin {
        id
        name
        phone
        postcode
        photo {
          bucket
          region
          key
        }
        movements {
          nextToken
        }
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const deleteMovement = /* GraphQL */ `
  mutation DeleteMovement(
    $input: DeleteMovementInput!
    $condition: ModelMovementConditionInput
  ) {
    deleteMovement(input: $input, condition: $condition) {
      id
      title
      checkinID
      checkin {
        id
        name
        phone
        postcode
        photo {
          bucket
          region
          key
        }
        movements {
          nextToken
        }
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
