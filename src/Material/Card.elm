module Material.Card exposing
    ( CardConfig, cardConfig
    , card
    , CardContent
    , CardBlock
    , cardMediaConfig, cardMedia, CardMediaAspect(..)
    , cardPrimaryActionConfig, cardPrimaryAction
    , cardBlock
    , CardActions, cardActions, cardActionButton, cardActionIcon
    , cardFullBleedActions
    )

{-|

@docs CardConfig, cardConfig
@docs card

@docs CardContent

@docs CardBlock

@docs cardMediaConfig, cardMedia, CardMediaAspect

@docs cardPrimaryActionConfig, cardPrimaryAction

@docs cardBlock

@docs CardActions, cardActions, cardActionButton, cardActionIcon
@docs cardFullBleedActions

-}

import Html exposing (Html, text)
import Html.Attributes exposing (class)
import Html.Events
import Material.Button exposing (ButtonConfig, buttonConfig)
import Material.Icon exposing (IconConfig, iconConfig)


{-| TODO
-}
type alias CardConfig msg =
    { outlined : Bool
    , additionalAttributes : List (Html.Attribute msg)
    }


{-| TODO
-}
cardConfig : CardConfig msg
cardConfig =
    { outlined = False
    , additionalAttributes = []
    }


{-| TODO
-}
card : CardConfig msg -> CardContent msg -> Html msg
card config content =
    Html.node "mdc-card"
        (List.filterMap identity
            [ rootCs
            , outlinedCs config
            ]
            ++ config.additionalAttributes
        )
        (List.concat
            [ blocksElt content
            , actionsElt content
            ]
        )


blocksElt : CardContent msg -> List (Html msg)
blocksElt { blocks } =
    List.map (\(Block html) -> html) blocks


actionsElt : CardContent msg -> List (Html msg)
actionsElt content =
    case content.actions of
        Just (Actions { buttons, icons, fullBleed }) ->
            [ Html.div
                (List.filterMap identity
                    [ Just (class "mdc-card__actions")
                    , if fullBleed then
                        Just (class "mdc-card__actions--full-bleed")

                      else
                        Nothing
                    ]
                )
                (List.concat
                    [ if not (List.isEmpty buttons) then
                        [ Html.div [ class "mdc-card__action-buttons" ]
                            (List.map (\(Button button) -> button) buttons)
                        ]

                      else
                        []
                    , if not (List.isEmpty icons) then
                        [ Html.div [ class "mdc-card__action-icons" ]
                            (List.map (\(Icon icon) -> icon) icons)
                        ]

                      else
                        []
                    ]
                )
            ]

        Nothing ->
            []


rootCs : Maybe (Html.Attribute msg)
rootCs =
    Just (class "mdc-card")


outlinedCs : CardConfig msg -> Maybe (Html.Attribute msg)
outlinedCs { outlined } =
    if outlined then
        Just (class "mdc-card--outlined")

    else
        Nothing


{-| TODO
-}
type alias CardContent msg =
    { blocks : List (CardBlock msg)
    , actions : Maybe (CardActions msg)
    }


{-| TODO
-}
type CardBlock msg
    = Block (Html msg)


{-| TODO
-}
cardBlock : Html msg -> CardBlock msg
cardBlock =
    Block


{-| TODO
-}
type alias MediaConfig msg =
    { aspect : Maybe CardMediaAspect
    , additionalAttributes : List (Html.Attribute msg)
    }


{-| TODO
-}
cardMediaConfig : MediaConfig msg
cardMediaConfig =
    { aspect = Nothing
    , additionalAttributes = []
    }


{-| TODO
-}
type CardMediaAspect
    = Square
    | SixteenToNine


{-| TODO
-}
cardMedia : MediaConfig msg -> String -> CardBlock msg
cardMedia config backgroundImage =
    Block <|
        Html.div
            (List.filterMap identity
                [ mediaCs
                , backgroundImageAttr backgroundImage
                , aspectCs config
                ]
                ++ config.additionalAttributes
            )
            []


mediaCs : Maybe (Html.Attribute msg)
mediaCs =
    Just (class "mdc-card__media")


backgroundImageAttr : String -> Maybe (Html.Attribute msg)
backgroundImageAttr url =
    Just (Html.Attributes.style "background-image" ("url(\"" ++ url ++ "\")"))


aspectCs : MediaConfig msg -> Maybe (Html.Attribute msg)
aspectCs { aspect } =
    case aspect of
        Just Square ->
            Just (class "mdc-card__media--square")

        Just SixteenToNine ->
            Just (class "mdc-card__media--16-9")

        Nothing ->
            Nothing


{-| TODO
-}
type alias PrimaryActionConfig msg =
    { additionalAttributes : List (Html.Attribute msg)
    , onClick : Maybe msg
    }


{-| TODO
-}
cardPrimaryActionConfig : PrimaryActionConfig msg
cardPrimaryActionConfig =
    { additionalAttributes = []
    , onClick = Nothing
    }


{-| TODO
-}
cardPrimaryAction : PrimaryActionConfig msg -> List (CardBlock msg) -> List (CardBlock msg)
cardPrimaryAction config blocks =
    [ Block <|
        Html.div
            (List.filterMap identity
                [ primaryActionCs
                , primaryActionClickHandler config
                ]
                ++ config.additionalAttributes
            )
            (List.map (\(Block html) -> html) blocks)
    ]


primaryActionCs : Maybe (Html.Attribute msg)
primaryActionCs =
    Just (class "mdc-card__primary-action")


primaryActionClickHandler : PrimaryActionConfig msg -> Maybe (Html.Attribute msg)
primaryActionClickHandler { onClick } =
    Maybe.map Html.Events.onClick onClick


{-| TODO
-}
type CardActions msg
    = Actions
        { buttons : List (Button msg)
        , icons : List (Icon msg)
        , fullBleed : Bool
        }


{-| TODO
-}
cardActions : { buttons : List (Button msg), icons : List (Icon msg) } -> CardActions msg
cardActions { buttons, icons } =
    Actions { buttons = buttons, icons = icons, fullBleed = False }


{-| TODO
-}
cardFullBleedActions : Button msg -> CardActions msg
cardFullBleedActions button =
    Actions { buttons = [ button ], icons = [], fullBleed = True }


{-| TODO
-}
type Button msg
    = Button (Html msg)


{-| TODO
-}
cardActionButton : ButtonConfig msg -> String -> Button msg
cardActionButton buttonConfig label =
    Button <|
        Material.Button.textButton
            { buttonConfig
                | additionalAttributes =
                    class "mdc-card__action"
                        :: class "mdc-card__action--button"
                        :: buttonConfig.additionalAttributes
            }
            label


type Icon msg
    = Icon (Html msg)


{-| TODO
-}
cardActionIcon : IconConfig msg -> String -> Icon msg
cardActionIcon iconConfig iconName =
    Icon <|
        Material.Icon.icon
            { iconConfig
                | additionalAttributes =
                    class "mdc-card__action"
                        :: class "mdc-card__action--icon"
                        :: iconConfig.additionalAttributes
            }
            iconName