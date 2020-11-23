
export const updateCheckinWithPhoto = /* GraphQL */ `
  mutation updateCheckinWithPhoto(
    $input: UpdateCheckinInput!
    $condition: ModelCheckinConditionInput
  ) {
    updateCheckin(input: $input, condition: $condition) {
      id
      photo {
        bucket
        region
        key
      }
    }
  }
`;

export const updateCheckinBasicDetails = /* GraphQL */ `
  mutation updateCheckinBasicDetails(
    $input: UpdateCheckinInput!
    $condition: ModelCheckinConditionInput
  ) {
    updateCheckin(input: $input, condition: $condition) {
      id
      name
      phone
      postcode
      maskId
    }
  }
`;