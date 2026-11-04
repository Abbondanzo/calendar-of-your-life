"""Builds src/data/life-tables.json: period life expectancy (e_x) at every
single age 0-100, by country and sex, from the UN World Population
Prospects 2022 single-age mortality rates (the `mx1dt` table of the wpp2022
R package).

    curl -LO https://raw.githubusercontent.com/PPgp/wpp2022/master/data/mx1dt.rda
    pip install rdata pycountry
    python3 scripts/build-life-tables.py mx1dt.rda src/data/life-tables.json 2023
"""

import json
import sys
import warnings

import pycountry
import rdata

warnings.simplefilter('ignore')


def life_expectancy(rates):
    """e_x for ages 0..100 from single-year m_x, with 100+ as an open interval."""
    alive, survivors, years_lived = 1.0, [], []
    last = len(rates) - 1
    for age, m in enumerate(rates):
        survivors.append(alive)
        if age == last:
            years_lived.append(alive / m)
            break
        # Share of the year lived by those who die in it; low in infancy
        # (Coale-Demeny style), half a year otherwise
        a = (0.07 + 1.7 * m if m < 0.107 else 0.35) if age == 0 else 0.5
        q = min(1.0, m / (1 + (1 - a) * m))
        deaths = alive * q
        years_lived.append(alive - (1 - a) * deaths)
        alive -= deaths
    out, remaining = [], 0.0
    for age in range(last, -1, -1):
        remaining += years_lived[age]
        out.append(remaining / survivors[age])
    return out[::-1]


def main(rda_path, out_path, year):
    mx = rdata.conversion.convert(rdata.parser.parse_file(rda_path))['mx1dt']
    mx = mx[mx['year'].astype(int) == year]
    tables = {}
    for code, group in mx.groupby(mx['country_code'].astype(int)):
        # WPP uses UN M49 codes, which match ISO 3166 numeric for countries;
        # anything else (regions, income groups) is skipped
        country = pycountry.countries.get(numeric=f'{code:03d}')
        if not country:
            continue
        group = group.sort_values('age', key=lambda s: s.astype(int))
        entry = {}
        for sex, column in (('female', 'mxF'), ('male', 'mxM'), ('any', 'mxB')):
            rates = group[column].astype(float).tolist()
            if len(rates) != 101 or any(r <= 0 for r in rates):
                break
            # Tenths of a year, to keep the file small
            entry[sex] = [round(e * 10) for e in life_expectancy(rates)]
        else:
            tables[country.alpha_2] = entry
    with open(out_path, 'w') as f:
        json.dump(
            {
                'source': 'UN World Population Prospects 2022',
                'year': year,
                'tables': dict(sorted(tables.items())),
            },
            f,
            separators=(',', ':'),
        )
    print(f'{len(tables)} countries')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], int(sys.argv[3]))
