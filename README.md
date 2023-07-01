# Platform Splashpage

Running a kubernetes cluster with multiple public facing apps under different endpoints? Give your users a simple splashpage to
show all the different apps they have access to. Includes OAuth2 integration to omit apps based on auth rules.

Example:

```yaml
# values.yaml
global:
  url: "myhost.com"
  pageMetadata:
    title: "MyHost Splashpage"
    description: "Welcome to my host"
  auth:
    # openssl rand -base64 32 | tr -- '+/' '-_'
    cookieSecretRef:
      key: cookie
      name: cookie
    providers:
      keycloak:
        clientId: "splash"
        clientSecretRef:
          key: secret
          name: keycloak
        issuer: https://kc.myhost.com/realms/master
  apps:
    - name: Gitlab
      icon: gitlab.svg
      displayName: Gitlab
      link: "https://gitlab.myhost.com"
    - name: Jupyterhub
      icon: jupyterhub.svg
      link: "https://jupyterhub.myhost.com"
  publicFolder:
    configMap:
      name: publicAssets
---
apiVersion: v1
kind: Secret
metadata:
  name: cookie
type: Opaque
stringData:
  cookie: Y-H1MhbXOAo8MPAY2aYbLtei7xYRq9Nm9NXxiR9MpU8=
---
apiVersion: v1
kind: Secret
metadata:
  name: keycloak
type: Opaque
stringData:
  secret: <read from keycloak>
---
# kustomization.yaml
configMapGenerator:
  - name: publicAssets
    files:
      - gitlab.svg
      - jupyterhub.svg
```
