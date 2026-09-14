# Architecture

Request → headers → (WS proxy | router) → D1/KV → response

Modules: core, auth, users, protocols, network, subscriptions, telegram, storage, admin, security.

Deferred: Wizard CLI OAuth installer.
