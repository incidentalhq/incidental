import re
from typing import Annotated

from pydantic import AfterValidator


def validate_domain_name(value: str):
    # Basic domain name pattern (simplified)
    domain_regex = (
        r"^(?!-)[A-Za-z0-9-]{1,63}(?<!-)\."  # Subdomain
        r"(?!-)(?:[A-Za-z0-9-]{1,63}\.)?"  # Optional second-level domain
        r"[A-Za-z]{2,}$"  # Top-level domain
    )

    if not isinstance(value, str):
        raise ValueError("Domain name must be a string.")

    if not re.match(domain_regex, value):
        raise ValueError("Invalid domain name format.")

    return value


DomainNameValidator = Annotated[str, AfterValidator(validate_domain_name)]
