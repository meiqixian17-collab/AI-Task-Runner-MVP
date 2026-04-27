const REQUEST_TIMEOUT_MS = 12000;

async function requestJson(url, options) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      ...options
    });

    const responseText = await response.text();
    const data = parseJsonOrFallback(responseText);

    if (!response.ok) {
      throw new Error(data.message || `Request failed: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("AI response timed out.");
      timeoutError.name = "RequestTimeoutError";
      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseJsonOrFallback(responseText) {
  if (!responseText) {
    return {};
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return {
      message: responseText
    };
  }
}

export function generateFirstStep(taskInput) {
  const payload =
    taskInput && typeof taskInput === "object" ? taskInput : { task: taskInput };

  return requestJson("/api/generate-first-step", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function generateNextStep(taskInput, stepHistory) {
  const payload =
    taskInput && typeof taskInput === "object"
      ? { ...taskInput, stepHistory }
      : { task: taskInput, stepHistory };

  return requestJson("/api/generate-next-step", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function diagnoseResistance(context) {
  return requestJson("/api/diagnose-resistance", {
    method: "POST",
    body: JSON.stringify({ context })
  });
}

export function planResistanceRecovery(context, diagnosis) {
  return requestJson("/api/plan-recovery", {
    method: "POST",
    body: JSON.stringify({ context, diagnosis })
  });
}

export function generateResistanceFallbackStep({
  context,
  diagnosis,
  recoveryPlan,
  validationFeedback
}) {
  return requestJson("/api/generate-fallback-step", {
    method: "POST",
    body: JSON.stringify({
      context,
      diagnosis,
      recoveryPlan,
      validationFeedback
    })
  });
}
