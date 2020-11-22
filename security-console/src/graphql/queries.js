/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getCheckin = /* GraphQL */ `
  query GetCheckin($id: ID!) {
    getCheckin(id: $id) {
      id
      name
      phone
      postcode
      maskId
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
export const listCheckins = /* GraphQL */ `
  query ListCheckins(
    $filter: ModelCheckinFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCheckins(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        phone
        postcode
        maskId
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
      nextToken
    }
  }
`;
export const getMovement = /* GraphQL */ `
  query GetMovement($id: ID!) {
    getMovement(id: $id) {
      id
      title
      checkinID
      checkin {
        id
        name
        phone
        postcode
        maskId
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
export const listMovements = /* GraphQL */ `
  query ListMovements(
    $filter: ModelMovementFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMovements(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        checkinID
        checkin {
          id
          name
          phone
          postcode
          maskId
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;