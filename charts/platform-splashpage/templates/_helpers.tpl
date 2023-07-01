{{/*
Expand the name of the chart.
*/}}
{{- define "platform-splashpage.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "platform-splashpage.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "platform-splashpage.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "platform-splashpage.labels" -}}
helm.sh/chart: {{ include "platform-splashpage.chart" . }}
{{ include "platform-splashpage.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "platform-splashpage.selectorLabels" -}}
app.kubernetes.io/name: {{ include "platform-splashpage.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "platform-splashpage.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "platform-splashpage.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{- define "platform-splashpage.appJson" -}}
{{ $apps := list }}
{{ $auths := list }}
{{- range $i, $app := .Values.global.apps -}}
{{ $icon := default $app.icon.url (dig "configMapRef" "key" "" $app.icon) }}
{{ $apps = omit $app "icon" | merge (dict "icon" $icon) | append $apps }}
{{- end -}}
{{- range $k, $v := .Values.global.auth.providers -}}
{{ $auths = get $v "name" | default $k | dict "type" $k "name" | merge (omit $v "clientSecret" "clientSecretRef") | append $auths }}
{{- end -}}
apps:
{{ $apps | toYaml | nindent 2 }}
auths:
{{ $auths | toYaml | nindent 2 }}
{{- end -}}

{{/*
  Currently only support environment variable 
  configuration for application. NextJS considers
  this best practice.
*/}}
{{- define "platform-splashpage.envConfig" -}}
- name: SPLASH_APP_DIR
  value: /config/app.json
{{- with .Values.global.url -}}
- name: SPLASH_URL
  value: {{ . | quote }}
- name: NEXTAUTH_URL
  value: {{ . | quote }}
{{- end -}}
{{- with $.Values.global.auth.cookieSecret -}}
- name: NEXTAUTH_SECRET 
  value: {{ . | quote }}
{{- end -}}
{{- with $.Values.global.auth.cookieSecretRef -}}
- name: NEXTAUTH_SECRET 
  valueFrom:
    secretRef: {{ . | toYaml | nindent 6 }}
{{- end -}}
{{- $providers := default dict $.Values.global.auth.providers | keys -}}
{{- range $_, $p := $providers -}}
  {{- $provider := get $.Values.global.auth.providers $p -}}
{{ with $provider.clientSecret }}
- name: {{ $p | upper | printf "SPLASH_AUTH_CLIENTSECRET_%s"  }}
  value: {{ . | quote }}
{{- end -}}
{{ with $provider.clientSecretRef }}
- name: {{ $p | upper | printf "SPLASH_AUTH_CLIENTSECRET_%s" }}
  valueFrom:
    secretRef: {{ . | toYaml | nindent 6 }}
{{- end -}}
{{- end -}}
{{- with .Values.extraEnv -}}
{{- toYaml . | nindent 2 }}
{{ end -}}  
{{- end -}}