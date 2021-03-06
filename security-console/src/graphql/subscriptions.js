/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateCheckin = /* GraphQL */ `
  subscription OnCreateCheckin {
    onCreateCheckin {
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
      identifiedPersonId
      faceIdComplete
      movements {
        items {
          id
          location
          identifiedPersonId
          faceMaskConfidence
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
export const onUpdateCheckin = /* GraphQL */ `
  subscription OnUpdateCheckin {
    onUpdateCheckin {
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
      identifiedPersonId
      faceIdComplete
      movements {
        items {
          id
          location
          identifiedPersonId
          faceMaskConfidence
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
export const onDeleteCheckin = /* GraphQL */ `
  subscription OnDeleteCheckin {
    onDeleteCheckin {
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
      identifiedPersonId
      faceIdComplete
      movements {
        items {
          id
          location
          identifiedPersonId
          faceMaskConfidence
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
export const onCreateMovement = /* GraphQL */ `
  subscription OnCreateMovement {
    onCreateMovement {
      id
      location
      photo {
        bucket
        region
        key
      }
      identifiedPersonId
      faceMaskConfidence
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
        identifiedPersonId
        faceIdComplete
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
export const onUpdateMovement = /* GraphQL */ `
  subscription OnUpdateMovement {
    onUpdateMovement {
      id
      location
      photo {
        bucket
        region
        key
      }
      identifiedPersonId
      faceMaskConfidence
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
        identifiedPersonId
        faceIdComplete
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
export const onDeleteMovement = /* GraphQL */ `
  subscription OnDeleteMovement {
    onDeleteMovement {
      id
      location
      photo {
        bucket
        region
        key
      }
      identifiedPersonId
      faceMaskConfidence
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
        identifiedPersonId
        faceIdComplete
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
