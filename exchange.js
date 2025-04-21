on(LocationSearchActions.updateLabelIncludeServiceArea, (state, { include }) => ({
  ...state,
  includeServiceAreaInLabel: include
}))
